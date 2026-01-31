
export class FlightController {
    constructor(spaceship, camera, collidables = []) {
        this.spaceship = spaceship;
        this.camera = camera;
        this.collidables = collidables; // Planets/Major bodies

        // Physics State - More realistic space flight
        this.speed = 0;
        this.maxSpeed = 1.8;           // Reduced for better control
        this.minSpeed = -0.3;          // Reverse limit
        this.acceleration = 0.02;      // Smoother acceleration
        this.deceleration = 0.015;     // Gentler braking
        this.drag = 0.995;             // Space drag (very little)

        // Input State
        this.keys = { forward: false, backward: false, left: false, right: false, boost: false };
        this.mousePos = { x: 0, y: 0 };
        this.mouseSensitivity = 0.03;  // Reduced mouse sensitivity

        // Steering - Smooth interpolation
        this.currentPitch = 0;
        this.currentYaw = 0;
        this.targetPitch = 0;
        this.targetYaw = 0;
        this.turnSmoothing = 0.08;     // Slower, smoother turns
        this.rollSmoothing = 0.06;     // Even smoother rolls
        this.currentRoll = 0;
        this.targetRoll = 0;
        this.maxRollSpeed = 0.025;     // Slower roll

        // Camera settings
        this.cameraLag = 0.08;         // Smoother camera follow
        this.cameraDistance = 20;      // Further back
        this.cameraHeight = 5;         // Higher up
        this.lookAheadDistance = 60;   // Further look target

        // Screen center dead zone (prevents jitter at center)
        this.deadZone = 0.05;

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => {
            // Normalize to -1 to 1
            this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'ShiftLeft': this.keys.boost = true; break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'ShiftLeft': this.keys.boost = false; break;
        }
    }

    update() {
        if (!this.spaceship) return;

        // 1. Throttle Control
        const boostMultiplier = this.keys.boost ? 2.5 : 1;
        const currentMaxSpeed = this.maxSpeed * boostMultiplier;
        const currentAccel = this.acceleration * boostMultiplier;

        if (this.keys.forward) {
            this.speed = Math.min(this.speed + currentAccel, currentMaxSpeed);
        } else if (this.keys.backward) {
            this.speed = Math.max(this.speed - this.deceleration, this.minSpeed);
        } else {
            // Natural deceleration in space (minimal drag)
            this.speed *= this.drag;
            if (Math.abs(this.speed) < 0.001) this.speed = 0;
        }

        // 2. Mouse Steering with Dead Zone
        let mouseX = this.mousePos.x;
        let mouseY = this.mousePos.y;
        
        // Apply dead zone
        if (Math.abs(mouseX) < this.deadZone) mouseX = 0;
        if (Math.abs(mouseY) < this.deadZone) mouseY = 0;

        // Calculate target rotations with exponential curve for finer control at center
        this.targetPitch = Math.sign(mouseY) * Math.pow(Math.abs(mouseY), 1.5) * this.mouseSensitivity;
        this.targetYaw = -Math.sign(mouseX) * Math.pow(Math.abs(mouseX), 1.5) * this.mouseSensitivity;

        // Smooth interpolation
        this.currentPitch += (this.targetPitch - this.currentPitch) * this.turnSmoothing;
        this.currentYaw += (this.targetYaw - this.currentYaw) * this.turnSmoothing;

        // Apply rotations
        this.spaceship.rotateX(this.currentPitch);
        this.spaceship.rotateY(this.currentYaw);

        // 3. Roll Control (A/D) - Smooth
        if (this.keys.left) {
            this.targetRoll = this.maxRollSpeed;
        } else if (this.keys.right) {
            this.targetRoll = -this.maxRollSpeed;
        } else {
            this.targetRoll = 0;
        }
        
        this.currentRoll += (this.targetRoll - this.currentRoll) * this.rollSmoothing;
        
        if (Math.abs(this.currentRoll) > 0.001) {
            this.spaceship.rotateZ(this.currentRoll);
        }

        // Normalize quaternion to prevent drift
        this.spaceship.quaternion.normalize();

        // 4. Movement & Collision
        const velocity = new THREE.Vector3(0, 0, -this.speed).applyQuaternion(this.spaceship.quaternion);
        const nextPos = this.spaceship.position.clone().add(velocity);

        let collision = false;
        if (this.collidables && this.collidables.length > 0) {
            // Sphere-based collision for planets
            for (const body of this.collidables) {
                const spec = body.userData?.spec;
                if (!spec || spec.type === 'belt') continue;

                const planetRadius = spec.radius || 0;
                if (planetRadius > 0) {
                    const distToCenter = nextPos.distanceTo(body.position);
                    const minDist = planetRadius + 5; // Buffer zone
                    
                    if (distToCenter < minDist) {
                        collision = true;
                        // Bounce off gently
                        this.speed *= -0.2;
                        
                        // Add slight visual jolt
                        this.currentPitch += (Math.random() - 0.5) * 0.02;
                        this.currentYaw += (Math.random() - 0.5) * 0.02;
                        break;
                    }
                }
            }
        }

        if (!collision) {
            this.spaceship.position.copy(nextPos);
        }

        // Update matrices before camera
        this.spaceship.updateMatrixWorld();
        this.updateCamera();
    }

    updateCamera() {
        // Calculate desired camera position behind and above ship
        const offset = new THREE.Vector3(0, this.cameraHeight, this.cameraDistance);
        const desiredPosition = offset.applyMatrix4(this.spaceship.matrixWorld);
        
        // Smooth camera follow
        this.camera.position.lerp(desiredPosition, this.cameraLag);
        
        // Look ahead of the ship for better flight feel
        const lookTarget = new THREE.Vector3(0, 0, -this.lookAheadDistance).applyMatrix4(this.spaceship.matrixWorld);
        
        // Smooth look interpolation
        const currentLook = new THREE.Vector3();
        this.camera.getWorldDirection(currentLook);
        const targetDir = lookTarget.clone().sub(this.camera.position).normalize();
        
        this.camera.lookAt(lookTarget);
    }

    // Get current speed for HUD display
    getSpeed() {
        return this.speed;
    }

    // Reset position and rotation
    reset() {
        this.speed = 0;
        this.currentPitch = 0;
        this.currentYaw = 0;
        this.currentRoll = 0;
        this.targetPitch = 0;
        this.targetYaw = 0;
        this.targetRoll = 0;
    }
}
