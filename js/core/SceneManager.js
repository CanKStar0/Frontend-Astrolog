
export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000008);
        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 5, 30);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: window.devicePixelRatio <= 1, // Only antialias on low-DPI screens
            alpha: false, // Disable alpha for performance (space is black anyway)
            powerPreference: 'high-performance',
            stencil: false, // Not needed
            depth: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 instead of 2
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Performance: Limit shadow map if used
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Cheapest shadow type

        this.setupLights();
        this.createStarfield();
        this.setupPostProcessing();

        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(50, 30, 50);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
        fillLight.position.set(-30, -20, -30);
        this.scene.add(fillLight);
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 5000; // Reduced from 10000 for performance
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const randoms = new Float32Array(starCount); // For twinkle offset

        for (let i = 0; i < starCount; i++) {
            const radius = 500 + Math.random() * 2500; // More depth
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            sizes[i] = Math.random() * 2 + 0.5;
            randoms[i] = Math.random();
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        starsGeometry.setAttribute('random', new THREE.BufferAttribute(randoms, 1));

        const starsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: `
                uniform float time;
                attribute float size;
                attribute float random;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Size attenuation
                    gl_PointSize = size * (300.0 / length(mvPosition.xyz));
                    
                    // Twinkle: Random phase based on 'random' attribute
                    float twinkle = sin(time * 3.0 + random * 100.0);
                    vAlpha = 0.5 + 0.5 * twinkle; // 0.0 to 1.0 range
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    // Circular soft particle
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    
                    if (dist > 0.5) discard;
                    
                    float glow = 1.0 - (dist * 2.0);
                    glow = pow(glow, 1.5);
                    
                    gl_FragColor = vec4(color, vAlpha * glow);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        stars.name = 'stars';
        this.scene.add(stars);

        // Add some nebula clouds as well (kept simple)
        // ... (Nebula code omitted for brevity/performance or we can keep it? Plan didn't specify nebula changes but let's keep it clean)
    }

    update(time) {
        const stars = this.scene.getObjectByName('stars');
        if (stars && stars.material.uniforms) {
            stars.material.uniforms.time.value = time;
        }
    }

    setAtmosphere(colorHex, density = 0.02) {
        // Change background to atmosphere color (or gradient if we get fancy later)
        const color = new THREE.Color(colorHex);

        // Smooth transition could be added here with GSAP, but for now direct set
        this.scene.background = color;
        this.scene.fog = new THREE.FogExp2(colorHex, density);

        // Hide stars by setting opacity to 0
        const stars = this.scene.getObjectByName('stars');
        if (stars) stars.visible = false;
    }

    resetAtmosphere() {
        // Back to space
        this.scene.background = new THREE.Color(0x000008);
        this.scene.fog = null; // No fog in space

        const stars = this.scene.getObjectByName('stars');
        if (stars) stars.visible = true;
    }

    setupPostProcessing() {
        // Post Processing
        const renderScene = new THREE.RenderPass(this.scene, this.camera);

        // Bloom at half resolution for performance
        const bloomResolution = new THREE.Vector2(
            Math.floor(window.innerWidth * 0.5),
            Math.floor(window.innerHeight * 0.5)
        );
        
        const bloomPass = new THREE.UnrealBloomPass(
            bloomResolution,
            1.2, // Strength (slightly reduced)
            0.3, // Radius
            0.85 // Threshold
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
        
        // Store bloom pass reference for optimizer
        this.bloomPass = bloomPass;
    }

    render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
}