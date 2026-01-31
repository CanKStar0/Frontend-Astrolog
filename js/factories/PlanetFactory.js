import { TextureFactory } from './TextureFactory.js';
import { planetSpecs } from '../config/planets.js';

export const PlanetFactory = {
    loader: new THREE.GLTFLoader(),

    createAtmosphere(radius, color, opacity) {
        // Simple Glow (Restored)
        const geometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity * 0.4,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    },

    createArtificialObject(spec, planetName = null, parentName = null) {
        const group = new THREE.Group();
        // Add a placeholder invisible mesh for raycasting/selection until model loads
        const placeholderGeo = new THREE.SphereGeometry(spec.radius, 8, 8);
        const placeholderMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(placeholderGeo, placeholderMat);
        group.add(hitBox);

        let modelPath = '';

        if (spec.type === 'station') {
            modelPath = 'assets/models/iss.glb';
        }
        else if (spec.type === 'telescope') {
            modelPath = 'assets/models/hubble.glb';
        }
        else if (spec.type === 'satellite') {
            modelPath = 'assets/models/sputnik_1.glb';
        }
        else if (spec.type === 'probe') {
            modelPath = 'assets/models/voyager_1.glb';
        }

        if (modelPath) {
            this.loader.load(modelPath, (gltf) => {
                const model = gltf.scene;

                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // Target size roughly 15x radius visual
                const scaleFactor = (spec.radius * 15) / size.length();
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Center the model so it rotates around its middle, not a random wing/pivot
                model.position.sub(center.multiplyScalar(scaleFactor));

                group.add(model);

                model.traverse(c => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                    }
                });
            }, undefined, (error) => {
                console.warn(`Failed to load model ${modelPath}:`, error);
                // Fallback to procedural
                const fallback = new THREE.Mesh(
                    new THREE.BoxGeometry(spec.radius, spec.radius, spec.radius),
                    new THREE.MeshStandardMaterial({ color: 0xff0000 })
                );
                group.add(fallback);
            });
        } else {
            // PROBE / Default (Voyager)
            const material = new THREE.MeshStandardMaterial({
                color: spec.color || 0xcccccc,
                roughness: 0.3,
                metalness: 0.8
            });

            if (spec.type === 'probe') {
                const dishGeo = new THREE.ConeGeometry(spec.radius * 1.5, spec.radius, 32, 1, true);
                const dish = new THREE.Mesh(dishGeo, material);
                dish.rotation.x = -Math.PI / 2;
                group.add(dish);

                const boxGeo = new THREE.BoxGeometry(spec.radius, spec.radius, spec.radius);
                const box = new THREE.Mesh(boxGeo, material);
                box.position.z = spec.radius;
                group.add(box);
            }
        }

        // Common Data
        const angle = Math.random() * Math.PI * 2;
        const dist = spec.distance ?? spec.orbitRadius ?? 0;

        if (dist > 0) {
            group.position.set(
                Math.cos(angle) * dist,
                0,
                Math.sin(angle) * dist
            );
        }

        group.userData = {
            isMoon: true,
            spec: spec,
            name: spec.info?.title || planetName || 'Object',
            parentName: parentName || spec.parentName || null, // Accept dynamic parent from signature
            orbitSpeed: spec.speed || 0,
            distance: dist,
            angle: angle
        };

        return group;
    },

    createEarth(spec) {
        const earthGroup = new THREE.Group();

        // Main sphere with texture
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateEarthTexture(),
            roughness: 0.8,
            metalness: 0.1,
            bumpScale: 0.05
        });

        const earthMesh = new THREE.Mesh(geometry, material);
        earthMesh.castShadow = true;
        earthMesh.receiveShadow = true;
        earthMesh.name = 'earth_surface';
        earthGroup.add(earthMesh);

        // Cloud layer
        const cloudGeometry = new THREE.SphereGeometry(spec.radius + 0.15, 64, 64);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateEarthClouds(),
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudMesh.name = 'earth_clouds';
        cloudMesh.userData = { rotationSpeed: spec.rotationSpeed * 1.3 };
        earthGroup.add(cloudMesh);

        // Atmosphere glow
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.2);
        earthGroup.add(atmosphere);

        return earthGroup;
    },

    createMercury(spec) {
        const mercuryGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateMercuryTexture(),
            roughness: 0.9,
            metalness: 0.1,
            bumpScale: 0.05
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mercuryGroup.add(mesh);
        return mercuryGroup;
    },

    createVenus(spec) {
        const venusGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateVenusTexture(),
            roughness: 0.7,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        venusGroup.add(mesh);

        // Dense atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.3);
        venusGroup.add(atmosphere);
        return venusGroup;
    },

    createUranus(spec) {
        const uranusGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateUranusTexture(),
            roughness: 0.6,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        uranusGroup.add(mesh);

        // Cyan atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.2);
        uranusGroup.add(atmosphere);
        return uranusGroup;
    },

    createNeptune(spec) {
        const neptuneGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateNeptuneTexture(),
            roughness: 0.6,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        neptuneGroup.add(mesh);

        // Blue atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.2);
        neptuneGroup.add(atmosphere);
        return neptuneGroup;
    },

    createMars(spec) {
        const marsGroup = new THREE.Group();

        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateMarsTexture(),
            roughness: 0.9,
            metalness: 0.05,
            bumpScale: 0.1
        });

        const marsMesh = new THREE.Mesh(geometry, material);
        marsMesh.castShadow = true;
        marsMesh.receiveShadow = true;
        marsMesh.name = 'mars_surface';
        marsGroup.add(marsMesh);

        // Thin atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.08);
        marsGroup.add(atmosphere);

        return marsGroup;
    },

    createJupiter(spec) {
        const jupiterGroup = new THREE.Group();

        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const texture = TextureFactory.generateJupiterTexture();
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.1
        });

        const jupiterMesh = new THREE.Mesh(geometry, material);
        jupiterMesh.castShadow = true;
        jupiterMesh.receiveShadow = true;
        jupiterMesh.name = 'jupiter_surface';
        jupiterGroup.add(jupiterMesh);

        // Thick atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.15);
        jupiterGroup.add(atmosphere);

        return jupiterGroup;
    },

    createBlackHole(spec) {
        const blackHoleGroup = new THREE.Group();

        // Event horizon
        const horizonGeometry = new THREE.SphereGeometry(spec.radius * 0.4, 32, 32);
        const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
        horizon.name = 'event_horizon';
        blackHoleGroup.add(horizon);

        // Photon sphere
        const photonGeometry = new THREE.SphereGeometry(spec.radius * 0.6, 32, 32);
        const photonMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });
        const photonSphere = new THREE.Mesh(photonGeometry, photonMaterial);
        blackHoleGroup.add(photonSphere);

        // Accretion disk
        const diskGeometry = new THREE.RingGeometry(spec.radius * 0.8, spec.radius * 2.5, 128, 8);
        const diskMaterial = new THREE.MeshBasicMaterial({
            map: TextureFactory.generateAccretionDiskTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const disk = new THREE.Mesh(diskGeometry, diskMaterial);
        disk.rotation.x = Math.PI / 2.2;
        disk.name = 'accretion_disk';
        disk.userData = { rotationSpeed: 0.008 };
        blackHoleGroup.add(disk);

        // Secondary tilted disk
        const disk2 = disk.clone();
        disk2.rotation.x = Math.PI / 2.5;
        disk2.rotation.z = Math.PI / 6;
        disk2.material = diskMaterial.clone();
        disk2.material.opacity = 0.5;
        disk2.userData = { rotationSpeed: -0.005 };
        blackHoleGroup.add(disk2);

        // Gravitational lensing glow
        const lensGeometry = new THREE.SphereGeometry(spec.radius * 1.2, 32, 32);
        const lensMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    vec3 color = mix(vec3(0.6, 0.3, 1.0), vec3(1.0, 0.5, 0.2), intensity);
                    gl_FragColor = vec4(color, intensity * 0.8);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        blackHoleGroup.add(lens);

        // Point light
        const light = new THREE.PointLight(0x9955ff, 2, 50);
        blackHoleGroup.add(light);

        return blackHoleGroup;
    },

    createSaturn(spec) {
        const saturnGroup = new THREE.Group();

        // 1. Planet Sphere
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const texture = TextureFactory.generateSaturnTexture();
        texture.wrapS = THREE.RepeatWrapping;

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7,
            metalness: 0.1
        });

        const saturnMesh = new THREE.Mesh(geometry, material);
        saturnMesh.castShadow = true;
        saturnMesh.receiveShadow = true;
        saturnGroup.add(saturnMesh);

        // 2. Rings
        const ringGeometry = new THREE.RingGeometry(spec.radius * 1.4, spec.radius * 2.5, 128);
        const ringTexture = TextureFactory.generateRingTexture();

        const ringMaterial = new THREE.MeshStandardMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.8,
            metalness: 0.2,
            emissive: 0x998877,
            emissiveMap: ringTexture,
            emissiveIntensity: 0.3
        });

        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.receiveShadow = true;
        rings.castShadow = true;
        saturnGroup.add(rings);

        // 3. Atmosphere
        const atmosphere = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.2);
        saturnGroup.add(atmosphere);

        return saturnGroup;
    },

    createMoon(spec) {
        const moonGroup = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 48, 48);
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateMoonTexture(),
            roughness: 0.9,
            metalness: 0.05,
            bumpScale: 0.1
        });

        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        moonGroup.add(moonMesh);

        return moonGroup;
    },

    // Fallback for generic moons
    createGenericMoon(moonSpec, parentName = null) {
        if (moonSpec.type) {
            // Inject parentName into moonSpec temporarily so createArtificialObject can see it
            // or pass it as an argument if we update the signature.
            // Let's update createArtificialObject signature for consistency.
            return this.createArtificialObject(moonSpec, null, parentName);
        }
        const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(moonSpec.radius, 32, 32);

        let texture = null;
        const n = moonSpec.name.toLowerCase();
        
        // Use specific textures for each moon
        if (n === 'io') texture = TextureFactory.generateIoTexture();
        else if (n === 'europa') texture = TextureFactory.generateEuropaTexture();
        else if (n === 'ganymede') texture = TextureFactory.generateGanymedeTexture();
        else if (n === 'callisto') texture = TextureFactory.generateCallistoTexture();
        else if (n === 'phobos') texture = TextureFactory.generatePhobosTexture();
        else if (n === 'deimos') texture = TextureFactory.generateDeimosTexture();
        else if (n === 'titan') texture = TextureFactory.generateTitanTexture();
        else if (n === 'rhea') texture = TextureFactory.generateRheaTexture();
        else texture = TextureFactory.generateMoonTexture();

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: moonSpec.color || 0xcccccc
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        const angle = Math.random() * Math.PI * 2;
        group.position.set(
            Math.cos(angle) * moonSpec.distance,
            0,
            Math.sin(angle) * moonSpec.distance
        );

        group.userData = {
            isMoon: true,
            spec: moonSpec,
            name: moonSpec.name,
            parentName: parentName, // Store parent reference
            orbitSpeed: moonSpec.speed || 0,
            distance: moonSpec.distance,
            angle: angle
        };

        return group;
    },

    createSun(spec) {
        const sunGroup = new THREE.Group();

        // 1. Core Sphere
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0xffaa00) },
                color2: { value: new THREE.Color(0xffcc33) },
                color3: { value: new THREE.Color(0xff4400) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                varying vec2 vUv;
                varying vec3 vPosition;
                varying vec3 vNormal;

                float noise(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                }
                
                float vnoise(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(mix(noise(i), noise(i + vec3(1,0,0)), f.x),
                            mix(noise(i + vec3(0,1,0)), noise(i + vec3(1,1,0)), f.x), f.y),
                        mix(mix(noise(i + vec3(0,0,1)), noise(i + vec3(1,0,1)), f.x),
                            mix(noise(i + vec3(0,1,1)), noise(i + vec3(1,1,1)), f.x), f.y), f.z);
                }
                
                float fbm(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 5; i++) {
                        v += a * vnoise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    float n = fbm(vPosition * 0.3 + vec3(0.0, time * 0.15, 0.0));
                    float n2 = fbm(vPosition * 0.8 - vec3(0.0, time * 0.05, 0.0));

                    vec3 color = mix(color3, color1, n);
                    color = mix(color, color2, n2 * 0.8);
                    
                    float darkening = 0.4 + 0.6 * clamp(vNormal.z, 0.0, 1.0);
                    color *= darkening;

                    float pulse = 0.95 + 0.05 * sin(time * 2.0);
                    
                    gl_FragColor = vec4(color * pulse, 1.0);
                }
            `
        });

        const sunMesh = new THREE.Mesh(geometry, shaderMaterial);
        sunGroup.add(sunMesh);

        // 2. Glow
        const glowGeometry = new THREE.SphereGeometry(spec.radius * 1.4, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0xffaa00) },
            },
            vertexShader: `
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    gl_FragColor = vec4(glowColor, intensity * 2.0);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGroup.add(glowMesh);

        // 3. Point Light
        const light = new THREE.PointLight(0xffaa00, 3, 500);
        sunGroup.add(light);

        sunGroup.userData.update = (time) => {
            shaderMaterial.uniforms.time.value = time;
        };

        return sunGroup;
    },

    createPlanet(planetName) {
        const spec = planetSpecs[planetName];
        let planetGroup;

        switch (planetName) {
            case 'earth': planetGroup = this.createEarth(spec); break;
            case 'mars': planetGroup = this.createMars(spec); break;
            case 'jupiter': planetGroup = this.createJupiter(spec); break;
            case 'saturn': planetGroup = this.createSaturn(spec); break;
            case 'sun': planetGroup = this.createSun(spec); break;
            case 'moon': planetGroup = this.createMoon(spec); break;
            case 'blackhole': planetGroup = this.createBlackHole(spec); break;

            case 'voyager_system':
            case 'voyager':
            case 'iss':
            case 'hubble':
                planetGroup = this.createArtificialObject(spec, planetName);
                break;

            case 'asteroidBelt_system':
            case 'asteroidbelt':
            case 'asteroidBelt':
                planetGroup = this.createAsteroidBelt(spec, planetName);
                break;

            case 'mercury': planetGroup = this.createMercury(spec); break;
            case 'venus': planetGroup = this.createVenus(spec); break;
            case 'uranus': planetGroup = this.createUranus(spec); break;
            case 'neptune': planetGroup = this.createNeptune(spec); break;

            // Direct Moon/Satellite Access
            case 'phobos':
            case 'deimos':
            case 'io':
            case 'europa':
            case 'ganymede':
            case 'callisto':
            case 'titan':
            case 'rhea':
                planetGroup = this.createGenericPlanet(spec, planetName);
                break;

            case 'iss':
            case 'hubble':
                planetGroup = this.createArtificialObject(spec);
                break;

            default: return null;
        }

        if (planetGroup) {
            if (spec.tilt) planetGroup.rotation.z = spec.tilt;

            // Set name for UI (Priority: Title > Key)
            const displayName = spec.info?.title || planetName;

            // Merge into existing userData (preserve isMoon, isReady etc)
            planetGroup.userData = Object.assign(planetGroup.userData || {}, {
                spec: spec,
                name: displayName
            });

            // Generate Moons
            if (spec.moons) {
                spec.moons.forEach(moonSpec => {
                    // Pass parent planet name to child objects
                    const moon = this.createGenericMoon(moonSpec, planetName);
                    planetGroup.add(moon);
                });
            }
        }

        return planetGroup;
    },

    createAsteroidBelt(spec, planetName) {
        const beltGroup = new THREE.Group();

        // Use InstancedMesh for performance
        const geometry = new THREE.DodecahedronGeometry(spec.radius, 0); // Low poly rock
        const material = new THREE.MeshStandardMaterial({
            map: TextureFactory.generateAsteroidTexture(spec.color),
            emissive: 0x111111, // Slight visibility boost
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });

        const count = spec.count || 2000;
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const isSystemBelt = spec.type === 'belt';
        const width = spec.isFocusOnly ? 25 : (isSystemBelt ? 150 : 80);
        const heightRange = spec.isFocusOnly ? 10 : (isSystemBelt ? 40 : 15);

        const dummy = new THREE.Object3D();
        const centerRadius = spec.orbitRadius || 0;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = centerRadius + (Math.random() - 0.5) * width;
            const height = (Math.random() - 0.5) * heightRange;

            dummy.position.set(
                Math.cos(angle) * dist,
                height,
                Math.sin(angle) * dist
            );

            // Random rotation
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Random scale variation
            const scale = 0.5 + Math.random() * 1.5;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
        beltGroup.add(mesh);

        // Add slow rotation to the whole group
        beltGroup.userData = {
            rotationSpeed: spec.rotationSpeed,
            spec: spec,
            name: 'Meteor Sea'
        };

        return beltGroup;
    },

    createGenericPlanet(spec, planetName) {
        const group = new THREE.Group();
        const geometry = new THREE.SphereGeometry(spec.radius, 64, 64);
        
        // Get the appropriate texture based on planet/moon name
        let texture = null;
        const name = (planetName || spec.info?.title || '').toLowerCase();
        
        if (name.includes('phobos')) {
            texture = TextureFactory.generatePhobosTexture();
        } else if (name.includes('deimos')) {
            texture = TextureFactory.generateDeimosTexture();
        } else if (name.includes('io')) {
            texture = TextureFactory.generateIoTexture();
        } else if (name.includes('europa')) {
            texture = TextureFactory.generateEuropaTexture();
        } else if (name.includes('ganymede')) {
            texture = TextureFactory.generateGanymedeTexture();
        } else if (name.includes('callisto')) {
            texture = TextureFactory.generateCallistoTexture();
        } else if (name.includes('titan')) {
            texture = TextureFactory.generateTitanTexture();
        } else if (name.includes('rhea')) {
            texture = TextureFactory.generateRheaTexture();
        } else if (name.includes('moon')) {
            texture = TextureFactory.generateMoonTexture();
        }
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: texture ? 0xffffff : (spec.color || 0xcccccc),
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        if (spec.atmosphereColor) {
            const atmo = this.createAtmosphere(spec.radius, spec.atmosphereColor, 0.3);
            group.add(atmo);
        }
        return group;
    }
};
