
export class MeteorSystem {
    constructor() {
        this.meteors = [];
        this.frameCount = 0;
    }

    createMeteor() {
        const meteorGroup = new THREE.Group();

        // Spawn position - random point on sphere around scene
        const spawnDistance = 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        meteorGroup.position.set(
            spawnDistance * Math.sin(phi) * Math.cos(theta),
            spawnDistance * Math.sin(phi) * Math.sin(theta),
            spawnDistance * Math.cos(phi)
        );

        // Meteor core - reduced segments from 16 to 8
        const coreGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            emissive: 0xffaa44,
            emissiveIntensity: 1
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        meteorGroup.add(core);

        // Glow - reduced segments from 16 to 8
        const glowGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6622,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        meteorGroup.add(glow);

        // Trail particles - reduced from 50 to 25
        const trailGeometry = new THREE.BufferGeometry();
        const trailCount = 25;
        const trailPositions = new Float32Array(trailCount * 3);
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

        const trailMaterial = new THREE.PointsMaterial({
            color: 0xff8844,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const trail = new THREE.Points(trailGeometry, trailMaterial);
        meteorGroup.add(trail);

        // REMOVED: PointLight per meteor - huge performance cost
        // const light = new THREE.PointLight(0xff6622, 1, 10);
        // meteorGroup.add(light);

        // Calculate velocity toward planet center
        const direction = new THREE.Vector3()
            .subVectors(new THREE.Vector3(0, 0, 0), meteorGroup.position)
            .normalize();

        const speed = 0.3 + Math.random() * 0.2;

        return {
            mesh: meteorGroup,
            velocity: direction.multiplyScalar(speed),
            trail: trail,
            trailPositions: [],
            age: 0,
            maxAge: 300
        };
    }

    createImpactEffect(scene, position) {
        // Flash
        const flashGeometry = new THREE.SphereGeometry(1, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        scene.add(flash);

        // Animate and remove
        gsap.to(flash.scale, {
            x: 3, y: 3, z: 3,
            duration: 0.3,
            ease: 'power2.out'
        });
        gsap.to(flashMaterial, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                scene.remove(flash);
            }
        });
    }

    update(scene, currentPlanet, canImpact = true) {
        this.frameCount++;
        
        // Spawn new meteors - reduced spawn rate (from 0.01 to 0.005)
        if (this.meteors.length < 2 && Math.random() < 0.005) { // Max 2 meteors (was 3), lower spawn chance
            const meteor = this.createMeteor();
            scene.add(meteor.mesh);
            this.meteors.push(meteor);
        }

        // Update existing meteors
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];

            // Move meteor
            meteor.mesh.position.add(meteor.velocity);

            // Update trail - every 2nd frame only
            if (this.frameCount % 2 === 0) {
                meteor.trailPositions.unshift(meteor.mesh.position.clone());
                if (meteor.trailPositions.length > 25) { // Reduced from 50
                    meteor.trailPositions.pop();
                }

                const positions = meteor.trail.geometry.attributes.position.array;
                for (let j = 0; j < meteor.trailPositions.length; j++) {
                    positions[j * 3] = meteor.trailPositions[j].x;
                    positions[j * 3 + 1] = meteor.trailPositions[j].y;
                    positions[j * 3 + 2] = meteor.trailPositions[j].z;
                }
                meteor.trail.geometry.attributes.position.needsUpdate = true;
            }

            meteor.age++;

            // Check collision with planet
            const distanceToCenter = meteor.mesh.position.length();

            // Safe access to radius
            let planetRadius = 10;
            if (currentPlanet && currentPlanet.userData && currentPlanet.userData.spec) {
                planetRadius = currentPlanet.userData.spec.radius;
            }

            if (distanceToCenter < planetRadius + 2 || meteor.age > meteor.maxAge) {
                // Create impact effect if enabled and we actually hit something
                if (canImpact && distanceToCenter < planetRadius + 2) {
                    this.createImpactEffect(scene, meteor.mesh.position.clone());
                }

                scene.remove(meteor.mesh);
                this.meteors.splice(i, 1);
            }
        }
    }

    clear(scene) {
        for (const meteor of this.meteors) {
            scene.remove(meteor.mesh);
        }
        this.meteors = [];
    }
}
