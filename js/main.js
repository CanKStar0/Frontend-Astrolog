import { SceneManager } from './core/SceneManager.js';
import { PlanetFactory } from './factories/PlanetFactory.js';
import { MeteorSystem } from './systems/MeteorSystem.js';
import { UIManager } from './ui/UIManager.js';
import { SpaceshipFactory } from './factories/SpaceshipFactory.js';
import { FlightController } from './systems/FlightController.js';

import { planetSpecs } from './config/planets.js';
import { EffectFactory } from './factories/EffectFactory.js';
import { SoundManager } from './systems/SoundManager.js';

class CosmicApp {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.meteorSystem = null;
        this.soundManager = null;
        this.uiManager = null;
        this.currentPlanet = null; // Used for Orbit Mode
        this.currentPlanetName = 'earth';

        // Solar System State
        this.systemPlanets = [];
        this.orbitLines = [];

        // Flight Mode State
        this.isFlightMode = false;
        this.spaceship = null;
        this.flightController = null;

        // Camera Orbit State
        this.orbitRadius = 30;
        this.targetOrbitRadius = 30;
        this.minOrbitRadius = 15;
        this.maxOrbitRadius = 80;

        // Spherical Coordinates
        this.targetTheta = 0;
        this.targetPhi = Math.PI / 2;
        this.currentTheta = 0;
        this.currentPhi = Math.PI / 2;

        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.previousMouse = { x: 0, y: 0 };
        this.isDragging = false;

        // Surface Check
        this.nearbyPlanet = null;

        this.init();
    }

    init() {
        const canvas = document.getElementById('cosmos-canvas');
        this.sceneManager = new SceneManager(canvas);
        this.meteorSystem = new MeteorSystem();
        this.soundManager = new SoundManager();

        this.uiManager = new UIManager(
            (planetName) => {
                if (planetName === 'compare') {
                    this.toggleComparisonMode();
                } else {
                    this.switchPlanet(planetName);
                }
            },
            () => this.soundManager.playHoverSound(),
            () => this.soundManager.playClickSound()
        );

        // Add Effects
        const starField = EffectFactory.createStarField(1500);
        this.sceneManager.scene.add(starField);



        this.initInputListeners();

        ['click', 'keydown'].forEach(event => {
            window.addEventListener(event, () => {
                this.soundManager.init();
            }, { once: true });
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyF') {
                // If in comparison mode, exit it first then enter flight mode
                if (this.isComparisonMode) {
                    this.exitComparisonMode();
                    // Small delay to let cleanup finish
                    setTimeout(() => this.toggleFlightMode(), 100);
                } else {
                    this.toggleFlightMode();
                }
            }
            // Only allow keyboard navigation when not in flight or comparison mode
            if (!this.isFlightMode && !this.isComparisonMode) {
                this.handleKeyboardNavigation(e);
            }
        });



        this.animate();
        this.playIntroCinematic();
    }

    initInputListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMouse.x;
                const deltaY = e.clientY - this.previousMouse.y;
                this.targetTheta -= deltaX * 0.005;
                this.targetPhi -= deltaY * 0.005;
                this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
                this.previousMouse = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.isFlightMode) {
                this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
                const interactables = [];
                this.systemPlanets.forEach(p => {
                    interactables.push(p);
                    p.children.forEach(c => interactables.push(c));
                });
                const intersects = this.raycaster.intersectObjects(interactables, true);

                if (intersects.length > 0) {
                    let hitObj = intersects[0].object;
                    while (hitObj && (!hitObj.userData || !hitObj.userData.spec)) {
                        hitObj = hitObj.parent;
                    }
                    if (hitObj && hitObj.userData && hitObj.userData.spec && hitObj.userData.spec.info) {
                        this.uiManager.updateInfoPanel(hitObj.userData.spec.info);
                        this.uiManager.showInfoPanel();
                        this.soundManager.playClickSound();
                    }
                }
                return;
            }

            this.isDragging = true;
            this.autoRotate = false;
            this.previousMouse = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            document.body.style.cursor = 'default';
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.05;
            this.targetOrbitRadius += e.deltaY * zoomSpeed;
            this.targetOrbitRadius = Math.max(this.minOrbitRadius, Math.min(this.maxOrbitRadius, this.targetOrbitRadius));
        }, { passive: false });

        this.initCustomCursor();
    }

    initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(updateCursor);
        };
        updateCursor();
    }

    switchPlanet(planetName) {
        if (planetName === this.currentPlanetName) return;

        // If in flight mode, exit it first to return to orbit mode
        if (this.isFlightMode) {
            this.toggleFlightMode();
        }

        this.currentPlanetName = planetName;
        const tl = gsap.timeline();
        this.soundManager.playClickSound();
        this.soundManager.playWarpSound();

        if (this.currentPlanet) {
            tl.to(this, { targetOrbitRadius: 100, duration: 1.2, ease: 'power2.in' });
            tl.to(this.currentPlanet.scale, { x: 0, y: 0, z: 0, duration: 1 }, '<');
        }

        tl.call(() => {
            if (this.currentPlanet) {
                this.sceneManager.scene.remove(this.currentPlanet);
                this.currentPlanet = null;
            }
            const planetGroup = PlanetFactory.createPlanet(planetName);
            if (planetGroup) {
                planetGroup.position.set(0, 0, 0);
                this.sceneManager.scene.add(planetGroup);
                this.currentPlanet = planetGroup;

                if (planetGroup.userData.spec) {
                    const spec = planetGroup.userData.spec;
                    if (spec.info) this.uiManager.updateInfoPanel(spec.info);
                    const radius = spec.radius || 10;
                    this.minOrbitRadius = radius * 1.5;
                    this.maxOrbitRadius = radius * 10;
                }
                planetGroup.scale.set(1, 1, 1);
                planetGroup.position.set(0, 0, -1000);
                gsap.to(planetGroup.position, { x: 0, y: 0, z: 0, duration: 2, ease: 'expo.out' });
                const radius = planetGroup.userData.spec.radius || 10;
                gsap.to(this, { targetOrbitRadius: radius * 3.5, duration: 2.5, ease: 'power2.out' });
            }
        });
    }

    loadPlanet(planetName) {
        if (this.currentPlanet) {
            this.sceneManager.scene.remove(this.currentPlanet);
        }
        const planetGroup = PlanetFactory.createPlanet(planetName);
        if (planetGroup) {
            this.sceneManager.scene.add(planetGroup);
            this.currentPlanet = planetGroup;
            if (planetGroup.userData.spec) {
                const spec = planetGroup.userData.spec;
                if (spec.info) this.uiManager.updateInfoPanel(spec.info, planetGroup.userData.parentName);
                const radius = spec.radius || 10;
                this.minOrbitRadius = radius * 1.5;
                this.maxOrbitRadius = radius * 10;
            }
            planetGroup.scale.set(0, 0, 0);
            gsap.to(planetGroup.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'back.out(1.7)' });
        }
    }

    createOrbitLine(radius) {
        const geometry = new THREE.TorusGeometry(radius, 0.2, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = Math.PI / 2;
        return orbit;
    }

    loadSolarSystem() {
        if (this.currentPlanet) {
            this.sceneManager.scene.remove(this.currentPlanet);
            this.currentPlanet = null;
        }

        this.systemPlanets = [];
        this.orbitLines = [];

        Object.keys(planetSpecs).forEach((key, index) => {
            const spec = planetSpecs[key];
            const group = PlanetFactory.createPlanet(key);

            if (group) {
                const orbitR = spec.orbitRadius || 0;
                const angle = index * (Math.PI / 4) + (Math.random() * 0.5);

                if (orbitR > 0) {
                    group.position.set(Math.cos(angle) * orbitR, 0, Math.sin(angle) * orbitR);
                    const orbit = this.createOrbitLine(orbitR);
                    this.sceneManager.scene.add(orbit);
                    this.orbitLines.push(orbit);
                } else {
                    group.position.set(0, 0, 0);
                }

                this.sceneManager.scene.add(group);
                this.systemPlanets.push(group);
            }
        });
        console.log("🌌 Full Solar System Loaded!");
    }

    unloadSolarSystem() {
        this.systemPlanets.forEach(p => this.sceneManager.scene.remove(p));
        this.orbitLines.forEach(o => this.sceneManager.scene.remove(o));
        this.systemPlanets = [];
        this.orbitLines = [];
    }
    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isComparisonMode) {
            this.sceneManager.render();
            return;
        }

        // Debug Execution Flow (Throttled)
        if (Math.random() < 0.005) {
            console.log(`Frame: FlightMode=${this.isFlightMode}, IsLanded=${this.isLanded}, SurfaceEnabled=${this.surfaceController?.enabled}`);
        }

        const time = performance.now() * 0.001;
        const delta = this.clock ? this.clock.getDelta() : 0.016; // Fix clock usage if needed or define delta
        // Main.js didn't have clock property visible in snippet, assuming it exists or using fixed delta for safety
        // Wait, standard ThreeJS pattern uses Clock. Let's use 0.016 approx if not sure.

        // ...

        if (this.isFlightMode) {



            // Flight Logic
            if (this.flightController) this.flightController.update();

            // ... (Planet rotation etc)

            // Landing Check
            let closestDist = Infinity;
            let closestPlanet = null;

            this.systemPlanets.forEach(planet => {
                // ... (Update rotations) ...

                const dist = this.spaceship.position.distanceTo(planet.position);
                const surfaceDist = dist - planet.userData.spec.radius;

                if (surfaceDist < closestDist) {
                    closestDist = surfaceDist;
                    closestPlanet = planet;
                }
            });

            // Update HUD...

            // Landing Trigger

            // Debug Mars specifically
            if (closestPlanet && closestPlanet.userData.name === 'mars') {
                // Log occasionally to avoid spam but catch data
                /*if (Math.random() < 0.05) { 
                    console.log("Mars Debug - Surface Dist:", closestDist, "Raw Dist:", this.spaceship.position.distanceTo(closestPlanet.position), "Radius:", closestPlanet.userData.spec.radius);
                }*/
            }

            if (closestPlanet) {
                this.nearbyPlanet = closestPlanet;
                // Landing prompt removed
            } else {
                this.nearbyPlanet = null;
            }

            // ... (Rest of flight loop)
        }

        // ... (Orbit logic)
    }

    landOnPlanet() {
        if (!this.nearbyPlanet) return;

        console.log("Landing on", this.nearbyPlanet.userData.name);
        this.isLanded = true;

        // Hide Spaceship (or keep it visible as landing site)
        // Let's place spaceship on surface "below" us
        const radius = this.nearbyPlanet.userData.spec.radius;
        const planetPos = this.nearbyPlanet.position;
        const dir = new THREE.Vector3().subVectors(this.spaceship.position, planetPos).normalize();

        // Park ship on surface (offset from player so we don't spawn inside it)
        const shipOffset = new THREE.Vector3(10, 0, 0).applyQuaternion(this.sceneManager.camera.quaternion);
        const shipPos = dir.clone().multiplyScalar(radius + 0.5).add(shipOffset); // Offset along surface

        // Project ship pos back to sphere surface correctness
        shipPos.normalize().multiplyScalar(radius + 0.8); // Slightly embedded/landed

        this.spaceship.position.copy(planetPos).add(shipPos);
        this.spaceship.lookAt(planetPos); // Landed orientation
        this.spaceship.visible = false; // HIDE SHIP FOR TRUE FPS

        // Enter Surface Mode
        this.surfaceController.enterPlanet(this.nearbyPlanet, dir); // Start pos direction

        // Set Atmosphere
        const spec = this.nearbyPlanet.userData.spec;
        if (spec.atmosphereColor) {
            this.sceneManager.setAtmosphere(spec.atmosphereColor, 0.015); // Slightly less fog
        }

        this.uiManager.updateLandingPrompt(false);
        this.uiManager.toggleInteractionPrompt(false); // Hide HUD elements

        // Show controls hint
        console.log("Landed. Controls: WASD to Walk, SPACE to Jump, Mouse to Look.");
    }

    takeOff() {
        console.log("Taking off");
        this.isLanded = false;
        this.spaceship.visible = true; // SHOW SHIP
        this.surfaceController.exitPlanet();
        this.sceneManager.resetAtmosphere();

        // Reposition camera to ship
        this.sceneManager.camera.position.copy(this.spaceship.position).add(new THREE.Vector3(0, 5, 20)); // Behind ship
        this.sceneManager.camera.lookAt(this.spaceship.position);

        // Push ship up a bit
        const radius = this.nearbyPlanet.userData.spec.radius;
        const planetPos = this.nearbyPlanet.position;
        const dir = new THREE.Vector3().subVectors(this.spaceship.position, planetPos).normalize();
        this.spaceship.position.add(dir.multiplyScalar(10)); // Launch height

        this.flightController.speed = 10; // Initial launch speed
    }

    // ...

    initInputListeners() {
        // Mouse Move
        // Mouse Move
        document.addEventListener('mousemove', (e) => {
            // Standard normalized mouse for Raycaster
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            // Target mouse for Orbit Controls
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMouse.x;
                const deltaY = e.clientY - this.previousMouse.y;
                this.targetTheta -= deltaX * 0.005;
                this.targetPhi -= deltaY * 0.005;
                this.targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.targetPhi));
                this.previousMouse = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mousedown', (e) => {
            // FLIGHT MODE INTERACTION WITH RAYCASTER
            if (this.isFlightMode) {
                // Raycast from camera
                this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

                // Collect interactable objects (Planets + Children/Moons)
                const interactables = [];
                this.systemPlanets.forEach(p => {
                    interactables.push(p);
                    p.children.forEach(c => interactables.push(c));
                });

                const intersects = this.raycaster.intersectObjects(interactables, true); // Recursive true just in case

                if (intersects.length > 0) {
                    // Find first valid object with spec info or its parent
                    let hitObj = intersects[0].object;

                    // Traverse up to find object with userData.spec
                    while (hitObj && (!hitObj.userData || !hitObj.userData.spec)) {
                        hitObj = hitObj.parent;
                    }

                    if (hitObj && hitObj.userData && hitObj.userData.spec && hitObj.userData.spec.info) {
                        this.uiManager.updateInfoPanel(hitObj.userData.spec.info, hitObj.userData.parentName);
                        this.uiManager.showInfoPanel();
                        this.soundManager.playClickSound();
                    }
                }
                return;
            }

            this.isDragging = true;
            this.autoRotate = false;
            this.previousMouse = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            document.body.style.cursor = 'default';
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.05;
            this.targetOrbitRadius += e.deltaY * zoomSpeed;
            this.targetOrbitRadius = Math.max(this.minOrbitRadius, Math.min(this.maxOrbitRadius, this.targetOrbitRadius));
        }, { passive: false });

        this.initCustomCursor();
    }

    initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(updateCursor);
        };
        updateCursor();
    }

    switchPlanet(planetName) {
        if (planetName === this.currentPlanetName) return;

        // If in flight mode, exit it first to return to orbit mode
        if (this.isFlightMode) {
            this.toggleFlightMode();
        }

        this.currentPlanetName = planetName;
        const tl = gsap.timeline();
        this.soundManager.playClickSound();
        this.soundManager.playWarpSound();

        if (this.currentPlanet) {
            tl.to(this, { targetOrbitRadius: 100, duration: 1.2, ease: 'power2.in' });
            tl.to(this.currentPlanet.scale, { x: 0, y: 0, z: 0, duration: 1 }, '<');
        }

        tl.call(() => {
            if (this.currentPlanet) {
                this.sceneManager.scene.remove(this.currentPlanet);
                this.currentPlanet = null;
            }
            const planetGroup = PlanetFactory.createPlanet(planetName);
            if (planetGroup) {
                planetGroup.position.set(0, 0, 0);
                this.sceneManager.scene.add(planetGroup);
                this.currentPlanet = planetGroup;

                if (planetGroup.userData.spec) {
                    const spec = planetGroup.userData.spec;
                    if (spec.info) this.uiManager.updateInfoPanel(spec.info);
                    const radius = spec.radius || 10;
                    this.minOrbitRadius = radius * 1.5;
                    this.maxOrbitRadius = radius * 10;
                }
                planetGroup.scale.set(1, 1, 1);
                planetGroup.position.set(0, 0, -1000);
                gsap.to(planetGroup.position, { x: 0, y: 0, z: 0, duration: 2, ease: 'expo.out' });
                const radius = planetGroup.userData.spec.radius || 10;
                gsap.to(this, { targetOrbitRadius: radius * 3.5, duration: 2.5, ease: 'power2.out' });
            }
        });
    }

    loadPlanet(planetName) {
        if (this.currentPlanet) {
            this.sceneManager.scene.remove(this.currentPlanet);
        }
        const planetGroup = PlanetFactory.createPlanet(planetName);
        if (planetGroup) {
            this.sceneManager.scene.add(planetGroup);
            this.currentPlanet = planetGroup;
            if (planetGroup.userData.spec) {
                const spec = planetGroup.userData.spec;
                if (spec.info) this.uiManager.updateInfoPanel(spec.info, planetGroup.userData.parentName);
                const radius = spec.radius || 10;
                this.minOrbitRadius = radius * 1.5;
                this.maxOrbitRadius = radius * 10;
            }
            planetGroup.scale.set(0, 0, 0);
            gsap.to(planetGroup.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'back.out(1.7)' });
        }
    }

    // --- SOLAR SYSTEM LOGIC ---

    createOrbitLine(radius) {
        const geometry = new THREE.TorusGeometry(radius, 0.2, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Mesh(geometry, material);
        orbit.rotation.x = Math.PI / 2;
        return orbit;
    }

    loadSolarSystem() {
        if (this.currentPlanet) {
            this.sceneManager.scene.remove(this.currentPlanet);
            this.currentPlanet = null;
        }

        this.systemPlanets = [];
        this.orbitLines = [];

        Object.keys(planetSpecs).forEach((key, index) => {
            const spec = planetSpecs[key];
            if (spec.isFocusOnly) return; // Skip focus-specific versions

            const group = PlanetFactory.createPlanet(key);

            if (group) {
                const orbitR = spec.orbitRadius || 0;

                // Position logic: Random angle for variety, but semi-realistic distribution
                const angle = index * (Math.PI / 4) + (Math.random() * 0.5); // Spread them out

                if (orbitR > 0 && spec.type !== 'belt') {
                    group.position.set(
                        Math.cos(angle) * orbitR,
                        0,
                        Math.sin(angle) * orbitR
                    );

                    // Add Orbit Line
                    const orbit = this.createOrbitLine(orbitR);
                    this.sceneManager.scene.add(orbit);
                    this.orbitLines.push(orbit);
                } else {
                    // Sun logic
                    group.position.set(0, 0, 0);
                }

                this.sceneManager.scene.add(group);
                this.systemPlanets.push(group);

                // Add simple text label sprite? (Skipping for now to keep performance high)
            }
        });

        console.log("🌌 Full Solar System Loaded!");
    }

    unloadSolarSystem() {
        this.systemPlanets.forEach(p => this.sceneManager.scene.remove(p));
        this.orbitLines.forEach(o => this.sceneManager.scene.remove(o));
        this.systemPlanets = [];
        this.orbitLines = [];
    }


    animate() {
        requestAnimationFrame(() => this.animate());

        const time = performance.now() * 0.001;
        if (this.sceneManager.update) this.sceneManager.update(time);

        if (this.isFlightMode && this.flightController) {
            this.flightController.update();

            // Find closest planet for HUD interaction
            let closestDist = Infinity;
            let closestPlanet = null;

            // Rotate ALL system planets & Moons
            this.systemPlanets.forEach(planet => {
                const spec = planet.userData.spec;
                // Planet Rotation
                if (spec && spec.rotationSpeed) {
                    planet.rotation.y += spec.rotationSpeed;
                }

                // Shader Update
                if (planet.userData.update) {
                    planet.userData.update(time);
                }

                // Moon Orbit Animation
                if (planet.children) {
                    planet.children.forEach(child => {
                        if (child.userData && child.userData.isMoon) {
                            child.userData.angle += child.userData.orbitSpeed * 0.5; // Animate angle
                            child.position.x = Math.cos(child.userData.angle) * child.userData.distance;
                            child.position.z = Math.sin(child.userData.angle) * child.userData.distance;
                        }
                    });
                }

                // Distance Check
                const dist = this.spaceship.position.distanceTo(planet.position);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestPlanet = planet;
                }
            });

            // Update HUD
            const speed = this.flightController.speed * 100; // Simulated km/h scale
            const targetName = closestPlanet ? closestPlanet.userData.name : 'DEEP SPACE';
            // Display Distance
            const displayDist = Math.floor(closestDist * 1000); // Simulated km

            this.uiManager.updateHUD(speed, targetName);

            // Update Compass
            this.uiManager.updateCompass(this.sceneManager.camera, this.systemPlanets);

            // Interaction: Check if mouse is hovering a planet (Raycaster)
            // But we want CLICK interaction. Raycasting every frame is expensive? No, it's fine for simple scene.
            // Let's rely on global mouseDown event which we will add below.

            this.targetInteractionPlanet = closestPlanet ? closestPlanet.userData.name : null;

            // Still update scene managers like stars etc.
            const stars = this.sceneManager.scene.getObjectByName('stars');
            if (stars) stars.rotation.y += 0.0001;

            this.meteorSystem.update(this.sceneManager.scene, this.spaceship);
            this.sceneManager.render();
            return;
        }

        // ORBIT MODE (Standard)
        this.orbitRadius += (this.targetOrbitRadius - this.orbitRadius) * 0.05;
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        if (!this.isDragging) this.targetTheta += 0.0005;

        const smoothing = this.isDragging ? 0.2 : 0.05;
        this.currentTheta += (this.targetTheta - this.currentTheta) * smoothing;
        this.currentPhi += (this.targetPhi - this.currentPhi) * smoothing;

        const finalTheta = this.currentTheta + (this.mouse.x * 0.5);
        const finalPhi = this.currentPhi + (this.mouse.y * 0.5);
        const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, finalPhi));

        // Clip Prevention (Orbit Mode)
        if (this.currentPlanet) {
            const minRadius = this.currentPlanet.userData.spec.radius * 1.5;
            this.orbitRadius = Math.max(minRadius, this.orbitRadius);
        }

        this.sceneManager.camera.position.x = this.orbitRadius * Math.sin(clampedPhi) * Math.cos(finalTheta);
        this.sceneManager.camera.position.y = this.orbitRadius * Math.cos(clampedPhi);
        this.sceneManager.camera.position.z = this.orbitRadius * Math.sin(clampedPhi) * Math.sin(finalTheta);
        this.sceneManager.camera.lookAt(0, 0, 0);

        const stars = this.sceneManager.scene.getObjectByName('stars');
        if (stars) stars.rotation.y += 0.0001;

        if (this.currentPlanet) {
            const spec = this.currentPlanet.userData.spec;
            this.currentPlanet.rotation.y += spec.rotationSpeed;
            if (this.currentPlanet.userData.update) this.currentPlanet.userData.update(time);
            this.currentPlanet.traverse((child) => {
                if (child.userData && child.userData.rotationSpeed) child.rotation.z += child.userData.rotationSpeed;
            });
        }

        // this.meteorSystem.update(this.sceneManager.scene, this.currentPlanet, false);
        this.sceneManager.render();
    }

    playIntroCinematic() {
        const progressBar = document.querySelector('.progress-bar');
        const statusText = document.querySelector('.loading-status');
        const updateProgress = (val, txt) => {
            if (progressBar) progressBar.style.width = val + '%';
            if (statusText) statusText.textContent = txt;
        };

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            updateProgress(progress, 'Initializing systems...');
            if (progress >= 100) {
                clearInterval(interval);
                this.finishLoading();
            }
        }, 50);
    }

    finishLoading() {
        this.loadPlanet('earth');
        this.uiManager.showUI();
        const info = document.getElementById('info-description');
        if (info) info.textContent += " (Press 'F' for Solar System Flight)";
    }



    toggleFlightMode() {
        this.isFlightMode = !this.isFlightMode;

        if (this.isFlightMode) {
            console.log("🚀 Entering Flight Mode: Full Solar System");
            this.loadSolarSystem();

            if (!this.spaceship) {
                this.spaceship = SpaceshipFactory.createSpaceship();
                this.sceneManager.scene.add(this.spaceship);
            }
            this.spaceship.visible = true;

            // Start near Earth
            this.spaceship.position.set(200, 20, 280);
            this.spaceship.lookAt(0, 0, 0); // Look at Sun

            if (this.flightController) {
                this.flightController.speed = 0;
                this.flightController.collidables = this.systemPlanets;
                this.flightController.currentPitch = 0;
                this.flightController.currentYaw = 0;
                this.flightController.currentRoll = 0;
                this.spaceship.rotation.set(0, 0, 0); // Hard reset orientation
            } else {
                this.flightController = new FlightController(this.spaceship, this.sceneManager.camera, this.systemPlanets);
            }

            document.body.style.cursor = 'none';
            if (this.uiManager.hideUI) this.uiManager.hideUI();

        } else {
            console.log("🛑 Exiting Flight Mode");
            this.unloadSolarSystem();
            if (this.spaceship) this.spaceship.visible = false;
            document.body.style.cursor = 'default';
            this.meteorSystem.clear(this.sceneManager.scene);


            this.loadPlanet('earth');
            this.targetOrbitRadius = 30;
            this.orbitRadius = 50;
            if (this.uiManager.showUI) this.uiManager.showUI();
        }
    }

    toggleComparisonMode() {
        if (this.isComparisonMode) {
            this.exitComparisonMode();
        } else {
            this.enterComparisonMode();
        }
    }

    enterComparisonMode() {
        console.log("📏 Entering Comparison Mode");
        
        // Prevent entering if already in comparison mode
        if (this.isComparisonMode) return;
        
        this.isComparisonMode = true;

        // Exit flight mode if active - do it cleanly
        if (this.isFlightMode) {
            this.isFlightMode = false;
            if (this.spaceship) {
                this.sceneManager.scene.remove(this.spaceship);
                this.spaceship = null;
            }
            this.flightController = null;
            this.systemPlanets.forEach(p => this.sceneManager.scene.remove(p));
            this.orbitLines.forEach(l => this.sceneManager.scene.remove(l));
            this.systemPlanets = [];
            this.orbitLines = [];
        }

        // Store current state for restoration
        this.preCompareState = {
            planetName: this.currentPlanetName,
            cameraPos: this.sceneManager.camera.position.clone(),
            orbitRadius: this.orbitRadius
        };

        // Remove current planet completely
        if (this.currentPlanet) {
            this.sceneManager.scene.remove(this.currentPlanet);
            this.currentPlanet = null;
        }

        // Hide UI elements
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) infoPanel.classList.add('hidden');
        const hud = document.getElementById('flight-hud');
        if (hud) hud.classList.add('hidden');

        // Clean up any existing comparison group
        if (this.comparisonGroup) {
            this.comparisonGroup.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            this.sceneManager.scene.remove(this.comparisonGroup);
            this.comparisonGroup = null;
        }

        // Create fresh Comparison Group
        this.comparisonGroup = new THREE.Group();
        this.comparisonGroup.name = 'comparisonGroup';

        // Comparison configuration - scale factors for visibility
        const comparisonConfig = [
            { key: 'sun', scale: 0.2, gap: 20 },
            { key: 'mercury', scale: 1.5, gap: 10 },
            { key: 'venus', scale: 1.2, gap: 12 },
            { key: 'earth', scale: 1.2, gap: 12 },
            { key: 'mars', scale: 1.4, gap: 10 },
            { key: 'jupiter', scale: 0.5, gap: 20 },
            { key: 'saturn', scale: 0.5, gap: 25 },
            { key: 'uranus', scale: 0.7, gap: 15 },
            { key: 'neptune', scale: 0.7, gap: 15 }
        ];

        let currentX = 0;
        const comparisonPlanets = [];

        comparisonConfig.forEach((config) => {
            const spec = planetSpecs[config.key];
            if (!spec) return;

            // Create planet without moons for cleaner comparison
            const planet = PlanetFactory.createPlanet(config.key);
            if (!planet) return;

            // Remove moons/satellites from comparison view
            const childrenToRemove = [];
            planet.traverse((child) => {
                if (child.userData?.isMoon) {
                    childrenToRemove.push(child);
                }
            });
            childrenToRemove.forEach(child => {
                if (child.parent) child.parent.remove(child);
            });

            const scaledRadius = spec.radius * config.scale;
            planet.scale.setScalar(config.scale);
            planet.position.set(currentX + scaledRadius, 0, 0);
            planet.userData.comparisonPlanet = true;

            this.comparisonGroup.add(planet);
            comparisonPlanets.push(planet);

            currentX += (scaledRadius * 2) + config.gap;
        });

        // Center the entire group
        this.comparisonGroup.position.set(-currentX / 2, 0, 0);
        this.sceneManager.scene.add(this.comparisonGroup);

        // Calculate camera position for best view
        const fov = 75 * (Math.PI / 180);
        const distance = (currentX / 2) / Math.tan(fov / 2);

        // Animate camera to overview position
        gsap.killTweensOf(this.sceneManager.camera.position);
        gsap.to(this.sceneManager.camera.position, {
            x: 0,
            y: distance * 0.1,
            z: distance * 0.9,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.sceneManager.camera.lookAt(0, 0, 0);
            }
        });

        // Add exit instruction overlay
        let exitTip = document.getElementById('compare-exit-tip');
        if (exitTip) exitTip.remove();
        
        exitTip = document.createElement('div');
        exitTip.id = 'compare-exit-tip';
        exitTip.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            color: white;
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            text-shadow: 0 0 15px rgba(0,200,255,0.9);
            pointer-events: none;
            z-index: 10000;
            background: rgba(0,0,0,0.5);
            padding: 15px 30px;
            border-radius: 10px;
            border: 1px solid rgba(0,200,255,0.3);
        `;
        exitTip.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">📊 Comparison Mode</div>
            <div style="font-size: 14px; opacity: 0.8;">Press <b>F</b> for Flight Mode | <b>ESC</b> to exit | Scroll to zoom</div>
        `;
        document.body.appendChild(exitTip);

        // Store comparison planets for interaction
        this.comparisonPlanetsArray = comparisonPlanets;
        
        // Add comparison mode key handler
        this.comparisonKeyHandler = (e) => {
            if (e.code === 'Escape') {
                this.exitComparisonMode();
            }
        };
        window.addEventListener('keydown', this.comparisonKeyHandler);
        
        // Add scroll zoom for comparison mode
        this.comparisonScrollHandler = (e) => {
            if (!this.isComparisonMode) return;
            const zoomSpeed = 0.05;
            const direction = e.deltaY > 0 ? 1 : -1;
            const camera = this.sceneManager.camera;
            const minZ = 20;
            const maxZ = 500;
            camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z + direction * camera.position.z * zoomSpeed));
            camera.lookAt(0, 0, 0);
        };
        window.addEventListener('wheel', this.comparisonScrollHandler);

        console.log("✅ Comparison mode ready with", comparisonPlanets.length, "planets");
    }

    exitComparisonMode() {
        console.log("🔙 Exiting Comparison Mode");
        
        if (!this.isComparisonMode) return;
        
        this.isComparisonMode = false;

        // Remove event listeners
        if (this.comparisonKeyHandler) {
            window.removeEventListener('keydown', this.comparisonKeyHandler);
            this.comparisonKeyHandler = null;
        }
        if (this.comparisonScrollHandler) {
            window.removeEventListener('wheel', this.comparisonScrollHandler);
            this.comparisonScrollHandler = null;
        }
        
        // Clear comparison planets array
        this.comparisonPlanetsArray = null;

        // Kill any ongoing camera animations
        gsap.killTweensOf(this.sceneManager.camera.position);

        // Clean up comparison group completely
        if (this.comparisonGroup) {
            this.comparisonGroup.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    } else {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            });
            this.sceneManager.scene.remove(this.comparisonGroup);
            this.comparisonGroup = null;
        }

        // Remove exit tip
        const tip = document.getElementById('compare-exit-tip');
        if (tip) tip.remove();

        // Restore previous planet
        const restorePlanet = this.preCompareState?.planetName || 'earth';
        
        // Reset camera
        this.sceneManager.camera.position.set(0, 5, 35);
        this.sceneManager.camera.lookAt(0, 0, 0);
        this.targetOrbitRadius = 35;
        this.orbitRadius = 35;

        // Show UI
        if (this.uiManager && this.uiManager.showUI) {
            this.uiManager.showUI();
        }

        // Load the planet
        this.loadPlanet(restorePlanet);
        
        // Clear stored state
        this.preCompareState = null;
        
        console.log("✅ Exited comparison mode, restored to", restorePlanet);
    }

    handleKeyboardNavigation(e) {
        const planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'blackhole'];
        const moonMap = {
            'earth': ['earth', 'moon', 'iss', 'hubble'],
            'mars': ['mars', 'phobos', 'deimos'],
            'jupiter': ['jupiter', 'io', 'europa', 'ganymede', 'callisto'],
            'saturn': ['saturn', 'titan', 'rhea']
        };

        let current = this.currentPlanetName;
        let parent = planets.includes(current) ? current : (planetSpecs[current]?.parentName || null);

        // Find parent if current is a focus-only moon
        if (!parent) {
            for (const p in moonMap) {
                if (moonMap[p].includes(current)) {
                    parent = p;
                    break;
                }
            }
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            // Planet navigation
            let mainTarget = parent || current;
            if (!planets.includes(mainTarget)) mainTarget = 'earth'; // Fallback

            let idx = planets.indexOf(mainTarget);
            if (e.key === 'ArrowRight') idx = (idx + 1) % planets.length;
            else idx = (idx - 1 + planets.length) % planets.length;

            this.switchPlanet(planets[idx]);
        }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Moon navigation
            if (!parent || !moonMap[parent]) return;

            const moons = moonMap[parent];
            let idx = moons.indexOf(current);
            if (idx === -1) idx = 0; // Start at planet if not found

            if (e.key === 'ArrowDown') idx = (idx + 1) % moons.length;
            else idx = (idx - 1 + moons.length) % moons.length;

            this.switchPlanet(moons[idx]);
        }
    }
}

window.addEventListener('load', () => { new CosmicApp(); });