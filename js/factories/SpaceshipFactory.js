
export class SpaceshipFactory {
    static createSpaceship() {
        const spaceship = new THREE.Group();
        spaceship.userData.isReady = false;

        // Container for the visual model
        const modelContainer = new THREE.Group();
        spaceship.add(modelContainer);

        // ---------------------------------------------------------
        // PROCEDURAL BURAN/SHUTTLE MODEL (FIXED AXIS)
        // Model MUST face -Z (Forward) for standard controls
        // ---------------------------------------------------------

        // Materials
        const whiteTileMat = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            shininess: 10,
            flatShading: false
        });

        const blackTileMat = new THREE.MeshPhongMaterial({
            color: 0x111111,
            roughness: 0.9
        });

        const windowMat = new THREE.MeshPhongMaterial({
            color: 0x224488,
            shininess: 90,
            emissive: 0x051133
        });

        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.6,
            roughness: 0.4
        });

        // 1. FUSELAGE (LOWER BODY)
        // Cylinder default is Y-aligned. Rotate X 90 to align with Z.
        const fuselageGeom = new THREE.CylinderGeometry(1.2, 1.2, 8, 24);
        const fuselage = new THREE.Mesh(fuselageGeom, whiteTileMat);
        fuselage.rotation.x = Math.PI / 2;
        fuselage.scale.set(1, 1, 0.8); // Flatten slightly y-axis relative to body? No, scale Z is length.
        // Actually scale (1, 0.8, 1) if aligned Y.
        // After rot X 90: Y became Z, Z became -Y.
        // Let's just use geometry cleanly.

        fuselage.rotation.x = Math.PI / 2; // Now aligns along Z.
        // Scale: X=Width, Y=Length(Z now), Z=Height(Y now)
        fuselage.scale.set(1, 1, 0.85); // Flatten height (visual Y)
        modelContainer.add(fuselage);

        // 2. NOSE CONE
        const noseLen = 2.5;
        const noseGeom = new THREE.CylinderGeometry(0.1, 1.2, noseLen, 24);
        const nose = new THREE.Mesh(noseGeom, blackTileMat);
        nose.rotation.x = Math.PI / 2; // Align Z
        nose.scale.set(1, 1, 0.85);
        nose.position.z = -5.25; // Forward is -Z
        modelContainer.add(nose);

        // Cockpit Windows
        const cockpitGeom = new THREE.BoxGeometry(1.1, 0.7, 1.5);
        const cockpit = new THREE.Mesh(cockpitGeom, windowMat);
        cockpit.position.set(0, 0.6, -4.0);
        cockpit.rotation.x = 0.3; // Slope back
        modelContainer.add(cockpit);

        // 3. CARGO BAY HUMP (UPPER BODY)
        const humpGeom = new THREE.CylinderGeometry(1.2, 1.2, 6, 24, 1, false, 0, Math.PI);
        const hump = new THREE.Mesh(humpGeom, whiteTileMat);
        // Hump is a half cylinder on top.
        // Default cylinder vertical Y.
        // We want it along Z.
        hump.rotation.x = Math.PI / 2; // Length along Z.
        // But we need the arc to face up. 
        // Initial arc 0 to PI starts at +X, goes counter-clockwise around Y.
        // We need to rotate around Z axis to face Up?
        // Let's experiment: Simple rotation Y 90?
        hump.rotation.z = Math.PI / 2;
        hump.rotation.y = Math.PI / 2;
        // Easier:
        // Cylinder vertical Y. Arc 0-PI.
        // Rotate X 90 -> Aligns Z. Top is +Y.
        hump.rotation.x = Math.PI / 2;
        hump.rotation.y = Math.PI; // Flip to top if needed?
        // Let's position manually
        hump.scale.set(0.95, 1, 0.6);
        hump.position.set(0, 0.8, 0.5); // Slightly back
        // Reset rot
        hump.rotation.set(Math.PI / 2, Math.PI, 0);
        modelContainer.add(hump);

        // 4. DELTA WINGS
        // Shape in XY plane, Extrude Z.
        // We want flat wings in XZ plane.
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(2.5, 2);   // Wing tip width
        wingShape.lineTo(2.5, -2);  // Wing tip back length
        wingShape.lineTo(0, -3);    // Back to fuselage

        // Actually let's draw top-down (XZ)
        // Point 0,0 is center fuselage.

        const wingShape2 = new THREE.Shape();
        wingShape2.moveTo(1, 1);    // Start near fuse mid-front
        wingShape2.lineTo(4.5, 3);  // Wing tip back
        wingShape2.lineTo(4.5, 4);  // Wing tip straight
        wingShape2.lineTo(1, 4);    // Back to fuse
        // This is weird coordinates.

        // Let's use simple Box scaling for wings to be safe and clean
        const wingGeomSimple = new THREE.BoxGeometry(5.5, 0.2, 4);
        const wings = new THREE.Mesh(wingGeomSimple, whiteTileMat);
        wings.position.set(0, -0.2, 1.5); // Backwards Z

        // Cut shape? 
        // Let's use Geometry modifiers or just a specific shape.
        // Custom Shape is best.
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(3.5, 3.5); // Out and back
        shape.lineTo(3.5, 5.0); // Straight back
        shape.lineTo(0, 5.0);   // Center back

        const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 };
        const wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const rightW = new THREE.Mesh(wingGeo, whiteTileMat);
        rightW.rotation.x = Math.PI / 2; // Lay flat
        rightW.position.set(1, -0.2, -1.0); // Offset from center
        modelContainer.add(rightW);

        const leftW = rightW.clone();
        leftW.scale.x = -1; // Mirror X
        leftW.position.x = -1;
        // Flip normals or cull face? Three.js double side usually OK or clone geometry?
        // Cloning mesh with neg scale affects lighting winding order sometimes.
        // Let's just create new mesh
        const leftW2 = new THREE.Mesh(wingGeo, whiteTileMat);
        leftW2.rotation.x = Math.PI / 2;
        leftW2.scale.x = -1;
        leftW2.position.set(-1, -0.2, -1.0);
        modelContainer.add(leftW2);


        // 5. VERTICAL STABILIZER (TAIL)
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(0, 3.5);  // Base length
        tailShape.lineTo(2.2, 3.5); // Top height
        tailShape.lineTo(3.0, 0);   // Back slope

        const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.05 });
        const tail = new THREE.Mesh(tailGeo, whiteTileMat);
        // It's extruded Z. We want it standing up in YZ plane.
        tail.rotation.y = -Math.PI / 2;
        tail.position.set(0.15, 1.0, 1.5); // Centered, Up, Back
        modelContainer.add(tail);


        // 6. ENGINES
        const engineGeom = new THREE.CylinderGeometry(0.5, 0.3, 1.0, 16);

        const centerEng = new THREE.Mesh(engineGeom, engineMat);
        centerEng.rotation.x = Math.PI / 2;
        centerEng.position.set(0, 1.5, 4.5); // Top back

        const leftEng = new THREE.Mesh(engineGeom, engineMat);
        leftEng.rotation.x = Math.PI / 2;
        leftEng.position.set(-0.8, 0, 4.5);

        const rightEng = new THREE.Mesh(engineGeom, engineMat);
        rightEng.rotation.x = Math.PI / 2;
        rightEng.position.set(0.8, 0, 4.5);

        modelContainer.add(centerEng);
        modelContainer.add(leftEng);
        modelContainer.add(rightEng);

        // Engine glow - single light instead of 3 for performance
        const createGlow = (pos) => {
            const light = new THREE.PointLight(0x00aaff, 1.5, 6);
            light.position.copy(pos);
            light.position.z += 0.5;
            return light;
        };
        // Only one engine light for performance
        modelContainer.add(createGlow(centerEng.position));


        // CHECK FOR EXTERNAL MODEL
        const loader = new THREE.GLTFLoader();
        loader.load(
            'assets/models/spaceship.glb',
            (gltf) => {
                console.log('External Spaceship Model Loaded!');
                spaceship.remove(modelContainer);
                const model = gltf.scene;

                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scaleVal = 8 / maxDim;
                model.scale.setScalar(scaleVal);

                // Center the model pivot
                model.position.sub(center.multiplyScalar(scaleVal));

                // Adjust rotation: Standard GLTF might need flip to face -Z 
                // We'll reset and use a standard orientation if the group is aligned.
                model.rotation.y = Math.PI;

                spaceship.add(model);
                spaceship.userData.isReady = true;
            },
            undefined,
            () => { spaceship.userData.isReady = true; }
        );

        spaceship.userData.radius = 3.0;
        return spaceship;
    }
}
