/**
 * ========================================
 * PARTICLE SYSTEM
 * ========================================
 * 
 * Advanced particle system for cosmic effects including space dust,
 * debris, collision particles, and atmospheric effects.
 * 
 * @module ParticleSystem
 */

/**
 * ParticleSystem Class
 * Manages particle effects throughout the application
 */
export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Particle groups
        this.particleGroups = [];
        this.activeParticles = [];
        
        // Space dust
        this.spaceDust = null;
        
        // Particle pool for performance
        this.particlePool = [];
        this.maxPoolSize = 1000; // Reduced from 5000
        
        // Frame skip counter for throttled updates
        this.frameCount = 0;
    }
    
    /**
     * Initialize particle system
     */
    init() {
        console.log('Initializing Particle System...');
        
        // Create ambient space dust
        this.createSpaceDust();
        
        // Initialize particle pool
        this.initializeParticlePool();
        
        console.log('✓ Particle System initialized');
    }
    
    /**
     * Create ambient space dust particles
     */
    createSpaceDust() {
        const dustCount = 1500; // Reduced from 3000 for performance
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        const dustSizes = new Float32Array(dustCount);
        const dustVelocities = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // Random position in a large cube
            dustPositions[i3] = (Math.random() - 0.5) * 200;
            dustPositions[i3 + 1] = (Math.random() - 0.5) * 200;
            dustPositions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            // Random sizes
            dustSizes[i] = Math.random() * 1.5 + 0.2;
            
            // Random slow velocities
            dustVelocities[i3] = (Math.random() - 0.5) * 0.02;
            dustVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            dustVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
        dustGeometry.setAttribute('velocity', new THREE.BufferAttribute(dustVelocities, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.8,
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        this.spaceDust = new THREE.Points(dustGeometry, dustMaterial);
        this.spaceDust.name = 'spaceDust';
        this.scene.add(this.spaceDust);
        
        console.log('✓ Space dust created');
    }
    
    /**
     * Initialize particle pool for reuse
     */
    initializeParticlePool() {
        for (let i = 0; i < this.maxPoolSize; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    /**
     * Create a single particle object
     * @returns {Object}
     */
    createParticle() {
        return {
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            life: 1.0,
            maxLife: 1.0,
            size: 1.0,
            color: new THREE.Color(1, 1, 1),
            active: false
        };
    }
    
    /**
     * Get particle from pool
     * @returns {Object|null}
     */
    getParticleFromPool() {
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].active) {
                this.particlePool[i].active = true;
                return this.particlePool[i];
            }
        }
        return null;
    }
    
    /**
     * Create explosion particle effect
     * @param {THREE.Vector3} position - Explosion center
     * @param {number} count - Number of particles
     * @param {number} color - Particle color
     * @param {number} speed - Explosion speed
     */
    createExplosion(position, count = 50, color = 0xffaa44, speed = 5) { // Reduced default from 100
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);
        const lifetimes = new Float32Array(count);
        
        const colorObj = new THREE.Color(color);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Start at explosion center
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            // Random spherical velocities
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const velocity = speed * (0.5 + Math.random() * 0.5);
            
            velocities[i3] = velocity * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = velocity * Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = velocity * Math.cos(phi);
            
            // Random sizes
            sizes[i] = Math.random() * 3 + 1;
            
            // Colors with variation
            const colorVariation = 0.8 + Math.random() * 0.2;
            colors[i3] = colorObj.r * colorVariation;
            colors[i3 + 1] = colorObj.g * colorVariation;
            colors[i3 + 2] = colorObj.b * colorVariation;
            
            // Lifetimes
            lifetimes[i] = 1.0 + Math.random();
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData = {
            type: 'explosion',
            age: 0,
            maxAge: 2.0,
            velocities: velocities,
            gravity: new THREE.Vector3(0, -0.5, 0)
        };
        
        this.scene.add(particleSystem);
        this.particleGroups.push(particleSystem);
        
        return particleSystem;
    }
    
    /**
     * Create shockwave effect
     * @param {THREE.Vector3} position
     * @param {number} maxRadius
     * @param {number} color
     */
    createShockwave(position, maxRadius = 20, color = 0x64c8ff) {
        const geometry = new THREE.RingGeometry(0.1, 0.2, 64);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const shockwave = new THREE.Mesh(geometry, material);
        shockwave.position.copy(position);
        shockwave.userData = {
            type: 'shockwave',
            age: 0,
            maxAge: 1.0,
            maxRadius: maxRadius
        };
        
        this.scene.add(shockwave);
        this.particleGroups.push(shockwave);
        
        // Animate shockwave expansion
        gsap.to(shockwave.scale, {
            x: maxRadius,
            y: maxRadius,
            z: maxRadius,
            duration: 1.0,
            ease: 'power2.out'
        });
        
        gsap.to(shockwave.material, {
            opacity: 0,
            duration: 1.0,
            ease: 'power2.in',
            onComplete: () => {
                this.removeParticleGroup(shockwave);
            }
        });
        
        return shockwave;
    }
    
    /**
     * Create trail particles
     * @param {THREE.Vector3} position
     * @param {number} color
     * @param {number} size
     */
    createTrail(position, color = 0xffffff, size = 1.5) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([position.x, position.y, position.z]);
        const sizes = new Float32Array([size]);
        const colors = new Float32Array([
            new THREE.Color(color).r,
            new THREE.Color(color).g,
            new THREE.Color(color).b
        ]);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const trail = new THREE.Points(geometry, material);
        trail.userData = {
            type: 'trail',
            age: 0,
            maxAge: 0.5
        };
        
        this.scene.add(trail);
        this.particleGroups.push(trail);
        
        // Fade out trail
        gsap.to(trail.material, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                this.removeParticleGroup(trail);
            }
        });
        
        return trail;
    }
    
    /**
     * Create debris field
     * @param {THREE.Vector3} position
     * @param {number} count
     * @param {number} radius
     */
    createDebrisField(position, count = 25, radius = 10) { // Reduced from 50
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const rotations = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Random position within radius
            const r = Math.random() * radius;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = position.x + r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = position.z + r * Math.cos(phi);
            
            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 2;
            velocities[i3 + 1] = (Math.random() - 0.5) * 2;
            velocities[i3 + 2] = (Math.random() - 0.5) * 2;
            
            // Random rotations
            rotations[i3] = (Math.random() - 0.5) * 0.1;
            rotations[i3 + 1] = (Math.random() - 0.5) * 0.1;
            rotations[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 3));
        
        const material = new THREE.PointsMaterial({
            size: 1.5,
            color: 0x888888,
            transparent: true,
            opacity: 0.8,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        
        const debris = new THREE.Points(geometry, material);
        debris.userData = {
            type: 'debris',
            age: 0,
            maxAge: 3.0
        };
        
        this.scene.add(debris);
        this.particleGroups.push(debris);
        
        return debris;
    }
    
    /**
     * Update particle system (called per frame)
     */
    update() {
        const deltaTime = 0.016; // Approximate 60fps
        this.frameCount++;
        
        // Update space dust every 2nd frame for performance
        if (this.spaceDust && (this.frameCount % 2 === 0)) {
            this.updateSpaceDust();
        }
        
        // Update particle groups
        for (let i = this.particleGroups.length - 1; i >= 0; i--) {
            const group = this.particleGroups[i];
            
            if (!group.userData) continue;
            
            group.userData.age += deltaTime;
            
            // Remove expired particle groups
            if (group.userData.age >= group.userData.maxAge) {
                this.removeParticleGroup(group);
                continue;
            }
            
            // Update based on type
            switch (group.userData.type) {
                case 'explosion':
                    this.updateExplosion(group, deltaTime);
                    break;
                case 'debris':
                    this.updateDebris(group, deltaTime);
                    break;
            }
        }
    }
    
    /**
     * Update space dust animation
     */
    updateSpaceDust() {
        const positions = this.spaceDust.geometry.attributes.position.array;
        const velocities = this.spaceDust.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply velocity
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            
            // Wrap around bounds
            if (Math.abs(positions[i]) > 100) positions[i] *= -1;
            if (Math.abs(positions[i + 1]) > 100) positions[i + 1] *= -1;
            if (Math.abs(positions[i + 2]) > 100) positions[i + 2] *= -1;
        }
        
        this.spaceDust.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Update explosion particles
     * @param {THREE.Points} explosion
     * @param {number} deltaTime
     */
    updateExplosion(explosion, deltaTime) {
        const positions = explosion.geometry.attributes.position.array;
        const velocities = explosion.userData.velocities;
        const gravity = explosion.userData.gravity;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply velocity
            positions[i] += velocities[i] * deltaTime * 10;
            positions[i + 1] += velocities[i + 1] * deltaTime * 10;
            positions[i + 2] += velocities[i + 2] * deltaTime * 10;
            
            // Apply gravity
            velocities[i + 1] += gravity.y * deltaTime;
        }
        
        explosion.geometry.attributes.position.needsUpdate = true;
        
        // Fade out
        const lifeProgress = explosion.userData.age / explosion.userData.maxAge;
        explosion.material.opacity = 1.0 - lifeProgress;
    }
    
    /**
     * Update debris particles
     * @param {THREE.Points} debris
     * @param {number} deltaTime
     */
    updateDebris(debris, deltaTime) {
        const positions = debris.geometry.attributes.position.array;
        const velocities = debris.geometry.attributes.velocity ? debris.geometry.attributes.velocity.array : null;
        
        if (velocities) {
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i] * deltaTime * 10;
                positions[i + 1] += velocities[i + 1] * deltaTime * 10;
                positions[i + 2] += velocities[i + 2] * deltaTime * 10;
            }
            
            debris.geometry.attributes.position.needsUpdate = true;
        }
        
        // Fade out
        const lifeProgress = debris.userData.age / debris.userData.maxAge;
        debris.material.opacity = 0.8 * (1.0 - lifeProgress);
    }
    
    /**
     * Remove particle group
     * @param {THREE.Object3D} group
     */
    removeParticleGroup(group) {
        const index = this.particleGroups.indexOf(group);
        if (index > -1) {
            this.particleGroups.splice(index, 1);
        }
        
        this.scene.remove(group);
        
        if (group.geometry) group.geometry.dispose();
        if (group.material) group.material.dispose();
    }
    
    /**
     * Clear all particle groups
     */
    clearAllParticles() {
        for (let i = this.particleGroups.length - 1; i >= 0; i--) {
            this.removeParticleGroup(this.particleGroups[i]);
        }
    }
    
    /**
     * Cleanup and dispose resources
     */
    dispose() {
        console.log('Disposing Particle System...');
        
        this.clearAllParticles();
        
        if (this.spaceDust) {
            this.scene.remove(this.spaceDust);
            this.spaceDust.geometry.dispose();
            this.spaceDust.material.dispose();
        }
        
        console.log('✓ Particle System disposed');
    }
}