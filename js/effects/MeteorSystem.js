/**
 * ========================================
 * METEOR SYSTEM
 * ========================================
 * 
 * Manages meteor impacts on celestial bodies with realistic
 * trajectories, collision detection, and visual effects.
 * 
 * @module MeteorSystem
 */

/**
 * MeteorSystem Class
 * Handles random meteor impacts and their visual effects
 */
export class MeteorSystem {
    constructor(scene, particleSystem) {
        this.scene = scene;
        this.particleSystem = particleSystem;

        // Active meteors
        this.meteors = [];
        this.maxMeteors = 3;

        // Impact settings
        this.impactInterval = 8000; // ms between impacts
        this.lastImpactTime = 0;
        this.enabled = true;

        // Target (planet center)
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.targetRadius = 10; // Planet radius for collision

        // Meteor configurations per planet
        this.meteorConfigs = {
            earth: {
                frequency: 8000,
                speed: 15,
                size: 0.3,
                color: 0xffaa44,
                glowColor: 0xff6622
            },
            mars: {
                frequency: 6000,
                speed: 18,
                size: 0.4,
                color: 0xff8844,
                glowColor: 0xff4422
            },
            jupiter: {
                frequency: 5000,
                speed: 25,
                size: 0.5,
                color: 0xffcc66,
                glowColor: 0xff8833
            },
            blackhole: {
                frequency: 4000,
                speed: 30,
                size: 0.6,
                color: 0xaa66ff,
                glowColor: 0x8844ff
            }
        };

        this.currentConfig = this.meteorConfigs.earth;
    }

    /**
     * Initialize meteor system
     */
    init() {
        console.log('Initializing Meteor System...');

        // Start meteor spawning
        this.startMeteorSpawning();

        console.log('✓ Meteor System initialized');
    }

    /**
     * Start automatic meteor spawning
     */
    startMeteorSpawning() {
        setInterval(() => {
            if (this.enabled && this.meteors.length < this.maxMeteors) {
                this.spawnMeteor();
            }
        }, this.currentConfig.frequency);
    }

    /**
     * Spawn a new meteor
     */
    spawnMeteor() {
        // Random spawn position in a sphere around the planet
        const spawnDistance = 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const spawnPosition = new THREE.Vector3(
            spawnDistance * Math.sin(phi) * Math.cos(theta),
            spawnDistance * Math.sin(phi) * Math.sin(theta),
            spawnDistance * Math.cos(phi)
        );

        // Create meteor object
        const meteor = this.createMeteorMesh(spawnPosition);

        // Calculate trajectory toward planet
        const direction = new THREE.Vector3()
            .subVectors(this.targetPosition, spawnPosition)
            .normalize();

        const velocity = direction.multiplyScalar(this.currentConfig.speed);

        // Add to scene and tracking
        this.scene.add(meteor);
        this.meteors.push({
            mesh: meteor,
            velocity: velocity,
            trail: [],
            age: 0,
            maxAge: 10
        });
    }

    /**
     * Create meteor mesh with glow
     * @param {THREE.Vector3} position
     * @returns {THREE.Group}
     */
    createMeteorMesh(position) {
        const meteorGroup = new THREE.Group();
        meteorGroup.position.copy(position);

        // Core meteor mesh geometry and appearance
        const geometry = new THREE.SphereGeometry(this.currentConfig.size, 8, 8); // Reduced from 16
        const material = new THREE.MeshStandardMaterial({
            color: this.currentConfig.color,
            emissive: this.currentConfig.color,
            emissiveIntensity: 0.8,
            roughness: 0.7,
            metalness: 0.3
        });

        const meteorMesh = new THREE.Mesh(geometry, material);
        meteorGroup.add(meteorMesh);

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(this.currentConfig.size * 1.5, 8, 8); // Reduced from 16
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.currentConfig.glowColor,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        meteorGroup.add(glowMesh);

        // Point light for illumination
        const light = new THREE.PointLight(this.currentConfig.glowColor, 2, 10);
        meteorGroup.add(light);

        return meteorGroup;
    }

    /**
     * Update meteor system (called per frame)
     */
    update() {
        const deltaTime = 0.016; // Approximate 60fps

        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];

            // Update age
            meteor.age += deltaTime;

            // Remove old meteors
            if (meteor.age >= meteor.maxAge) {
                this.removeMeteor(i);
                continue;
            }

            // Update position
            meteor.mesh.position.add(
                meteor.velocity.clone().multiplyScalar(deltaTime)
            );

            // Create trail particles - reduced frequency (from 0.3 to 0.15)
            if (Math.random() < 0.15) {
                this.particleSystem.createTrail(
                    meteor.mesh.position.clone(),
                    this.currentConfig.glowColor,
                    this.currentConfig.size * 2
                );
            }

            // Check for collision with planet
            const distance = meteor.mesh.position.distanceTo(this.targetPosition);

            if (distance <= this.targetRadius) {
                this.handleImpact(meteor.mesh.position.clone());
                this.removeMeteor(i);
            }
        }
    }

    /**
     * Handle meteor impact
     * @param {THREE.Vector3} position
     */
    handleImpact(position) {
        console.log('Meteor impact at', position);

        // Create explosion particles - reduced count
        this.particleSystem.createExplosion(
            position,
            80, // Reduced from 150
            this.currentConfig.color,
            8
        );

        // Create shockwave
        this.particleSystem.createShockwave(
            position,
            15,
            this.currentConfig.glowColor
        );

        // Create debris - reduced count
        this.particleSystem.createDebrisField(
            position,
            15, // Reduced from 30
            5
        );

        // Flash effect (could trigger camera shake)
        this.createImpactFlash(position);

        // Optional: Trigger camera shake
        // this.cameraSystem.shake(0.3, 0.2);
    }

    /**
     * Create impact flash effect
     * @param {THREE.Vector3} position
     */
    createImpactFlash(position) {
        // Create bright point light
        const flashLight = new THREE.PointLight(
            this.currentConfig.glowColor,
            5,
            30
        );
        flashLight.position.copy(position);

        this.scene.add(flashLight);

        // Animate flash
        gsap.to(flashLight, {
            intensity: 0,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                this.scene.remove(flashLight);
            }
        });
    }

    /**
     * Remove meteor from scene
     * @param {number} index
     */
    removeMeteor(index) {
        const meteor = this.meteors[index];

        if (meteor && meteor.mesh) {
            this.scene.remove(meteor.mesh);

            // Dispose geometries and materials
            meteor.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }

        this.meteors.splice(index, 1);
    }

    /**
     * Update meteor system for specific planet
     * @param {string} planetName
     */
    updateForPlanet(planetName) {
        if (this.meteorConfigs[planetName]) {
            this.currentConfig = this.meteorConfigs[planetName];
            console.log(`✓ Meteor system updated for ${planetName}`);
        }
    }

    /**
     * Set target planet radius
     * @param {number} radius
     */
    setTargetRadius(radius) {
        this.targetRadius = radius;
    }

    /**
     * Enable/disable meteor spawning
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Clear all active meteors
     */
    clearAllMeteors() {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            this.removeMeteor(i);
        }
    }

    /**
     * Cleanup and dispose resources
     */
    dispose() {
        console.log('Disposing Meteor System...');

        this.clearAllMeteors();
        this.enabled = false;

        console.log('✓ Meteor System disposed');
    }
}