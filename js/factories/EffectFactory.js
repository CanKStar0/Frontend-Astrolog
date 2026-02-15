
export const EffectFactory = {
    createStarField(count = 1000) { // Reduced default from 2000
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        const colorPalette = [
            new THREE.Color(0xffffff), // White
            new THREE.Color(0xccccff), // Blue-ish
            new THREE.Color(0xffccaa)  // Yellow-ish
        ];

        for (let i = 0; i < count; i++) {
            // Random position in a large sphere
            const r = 4000 + Math.random() * 4000;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            vertices.push(x, y, z);

            // Random color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: false
        });

        const starField = new THREE.Points(geometry, material);
        starField.name = 'starfield';
        return starField;
    },

    createWarpEffect(count = 500) { // Reduced from 1000
        // Warp Drive Effect: Lines radiating from center
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const velocity = [];

        // Create lines. Each line needs 2 points.
        // We will animate them in a vertex shader or manually update positions.
        // Simple approach: Use Points but stretch them with texture or use Lines.
        // Let's use LineSegments for "streaks".

        for (let i = 0; i < count; i++) {
            // Use a cylinder volume around the camera path
            const x = (Math.random() - 0.5) * 500;
            const y = (Math.random() - 0.5) * 500;
            const z = (Math.random() - 0.5) * 2000; // Depth

            // Line Start
            positions.push(x, y, z);
            // Line End (initially slightly offset Z)
            positions.push(x, y, z - 20);

            // Per-line random alpha/speed attribute could be useful but let's keep it simple
            const col = new THREE.Color(0x88ccff);
            colors.push(col.r, col.g, col.b);
            colors.push(col.r, col.g, col.b);

            // Store random speed factor
            velocity.push(1 + Math.random());
            velocity.push(1 + Math.random());
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 1));

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0, // Initially invisible
            blending: THREE.AdditiveBlending
        });

        const warpLines = new THREE.LineSegments(geometry, material);

        // Custom update function attached to object
        warpLines.userData = {
            active: false,
            baseOpacity: 0,
            update: (speed, camera) => {
                // If speed is high, show warp lines
                const threshold = 50; // km/s
                let targetOpacity = 0;

                if (speed > threshold) {
                    targetOpacity = Math.min((speed - threshold) / 100, 0.8);
                }

                // Lerp opacity
                warpLines.material.opacity += (targetOpacity - warpLines.material.opacity) * 0.1;

                if (warpLines.material.opacity < 0.01) {
                    warpLines.visible = false;
                    return;
                }
                warpLines.visible = true;

                // Animate lines to simulate passing by
                const positions = warpLines.geometry.attributes.position.array;
                const velocities = warpLines.geometry.attributes.velocity.array;

                // Move lines towards camera (or move them opposite to movement)
                // Since this is attached to camera or scene? 
                // Best to attach to Camera but move points? 
                // Or attach to Scene and move points relative to camera?
                // Easiest: Attach to Camera, move points along -Z, reset when too close.

                const moveSpeed = speed * 2; // Visual speed multiplier

                for (let i = 0; i < count; i++) {
                    const idx = i * 6; // 2 points * 3 coords

                    // Z coords
                    let z1 = positions[idx + 2];
                    let z2 = positions[idx + 5];

                    const v = velocities[i * 2];
                    const dist = moveSpeed * v;

                    z1 += dist;
                    z2 += dist;

                    // If passed camera (assuming camera looks down -Z? No, ThreeJS camera looks down -Z)
                    // Wait, if we move specific to camera local space.
                    // Let's assume this object is added to the CAMERA.

                    const limit = 200; // Behind camera
                    const spawnDist = -1000; // Far in front

                    if (z1 > limit) {
                        // Reset to front
                        const x = (Math.random() - 0.5) * 800;
                        const y = (Math.random() - 0.5) * 800;
                        const zOffset = (Math.random() * 500);

                        // New Z
                        z1 = spawnDist - zOffset;
                        z2 = z1 - (20 + speed * 0.5); // Streak length grows with speed

                        // New X, Y
                        positions[idx] = x;
                        positions[idx + 1] = y;
                        positions[idx + 3] = x;
                        positions[idx + 4] = y;
                    }
                    else {
                        // Stretch line based on speed
                        const len = 20 + speed * 2.0;
                        z2 = z1 - len;
                    }

                    positions[idx + 2] = z1;
                    positions[idx + 5] = z2;
                }

                warpLines.geometry.attributes.position.needsUpdate = true;
            }
        };

        return warpLines;
    }
};
