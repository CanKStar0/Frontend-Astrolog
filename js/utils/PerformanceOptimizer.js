/**
 * ========================================
 * PERFORMANCE OPTIMIZER
 * ========================================
 * 
 * Comprehensive performance optimization system that dynamically
 * adjusts rendering quality based on FPS. During flight mode,
 * optimizations are 2x more aggressive.
 * 
 * Features:
 * - Adaptive quality levels (Ultra, High, Medium, Low, Potato)
 * - Dynamic pixel ratio adjustment
 * - Frustum culling management
 * - Object LOD (Level of Detail) management
 * - Bloom pass optimization
 * - Shadow toggling
 * - Particle/Meteor budget control
 * - Frame skip for non-critical updates
 * 
 * @module PerformanceOptimizer
 */

export class PerformanceOptimizer {
    constructor() {
        // FPS Tracking
        this.fps = 60;
        this.fpsHistory = [];
        this.fpsHistorySize = 30; // 30 samples for smoother average
        this.frameCount = 0;
        this.lastFpsTime = performance.now();
        this.frameTimes = [];
        
        // Quality Levels: 0=Potato, 1=Low, 2=Medium, 3=High, 4=Ultra
        this.qualityLevel = 3; // Start at High
        this.targetFps = 55;
        this.criticalFps = 30;
        this.qualityNames = ['Potato', 'Low', 'Medium', 'High', 'Ultra'];
        
        // Cooldown to prevent rapid quality switching
        this.lastQualityChange = 0;
        this.qualityCooldown = 3000; // ms between quality changes
        
        // Flight mode flag - 2x aggressive optimizations
        this.isFlightMode = false;
        
        // Cached references
        this.renderer = null;
        this.composer = null;
        this.scene = null;
        this.camera = null;
        
        // Frame skip counters
        this.frameNumber = 0;
        
        // Quality presets
        this.qualityPresets = {
            4: { // Ultra
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                bloomEnabled: true,
                bloomStrength: 1.5,
                bloomRadius: 0.4,
                shadowsEnabled: true,
                maxParticles: 3000,
                maxMeteors: 3,
                starUpdateFrequency: 1,
                dustUpdateFrequency: 1,
                meteorTrailLength: 50,
                antialias: true
            },
            3: { // High
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                bloomEnabled: true,
                bloomStrength: 1.2,
                bloomRadius: 0.3,
                shadowsEnabled: true,
                maxParticles: 2000,
                maxMeteors: 3,
                starUpdateFrequency: 1,
                dustUpdateFrequency: 2,
                meteorTrailLength: 30,
                antialias: true
            },
            2: { // Medium
                pixelRatio: 1,
                bloomEnabled: true,
                bloomStrength: 0.8,
                bloomRadius: 0.2,
                shadowsEnabled: false,
                maxParticles: 1000,
                maxMeteors: 2,
                starUpdateFrequency: 2,
                dustUpdateFrequency: 3,
                meteorTrailLength: 20,
                antialias: false
            },
            1: { // Low
                pixelRatio: 0.75,
                bloomEnabled: false,
                bloomStrength: 0,
                bloomRadius: 0,
                shadowsEnabled: false,
                maxParticles: 500,
                maxMeteors: 1,
                starUpdateFrequency: 4,
                dustUpdateFrequency: 5,
                meteorTrailLength: 10,
                antialias: false
            },
            0: { // Potato
                pixelRatio: 0.5,
                bloomEnabled: false,
                bloomStrength: 0,
                bloomRadius: 0,
                shadowsEnabled: false,
                maxParticles: 200,
                maxMeteors: 1,
                starUpdateFrequency: 8,
                dustUpdateFrequency: 8,
                meteorTrailLength: 5,
                antialias: false
            }
        };
        
        // Active preset (will be set on init)
        this.activePreset = this.qualityPresets[this.qualityLevel];
        
        // Performance stats display
        this.statsElement = null;
        this.showStats = false;
    }
    
    /**
     * Initialize with renderer and scene references
     */
    init(renderer, composer, scene, camera) {
        this.renderer = renderer;
        this.composer = composer;
        this.scene = scene;
        this.camera = camera;
        
        // Initial optimizations
        if (this.renderer) {
            // Ensure frustum culling is on for all meshes
            this.scene.traverse((obj) => {
                if (obj.isMesh) {
                    obj.frustumCulled = true;
                }
            });
            
            // Disable auto-clear for manual control (small gain)
            this.renderer.autoClear = true;
            
            // Power preference
            this.renderer.powerPreference = 'high-performance';
        }
        
        // Create optional stats display
        this.createStatsDisplay();
        
        console.log('⚡ PerformanceOptimizer initialized at quality:', this.qualityNames[this.qualityLevel]);
    }
    
    /**
     * Call at the start of each frame
     */
    beginFrame() {
        this.frameNumber++;
        this.frameCount++;
        
        const now = performance.now();
        const elapsed = now - this.lastFpsTime;
        
        if (elapsed >= 500) { // Update FPS every 500ms
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsTime = now;
            
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.fpsHistorySize) {
                this.fpsHistory.shift();
            }
            
            // Check if quality adjustment needed
            this.evaluateQuality(now);
            
            // Update stats display
            this.updateStatsDisplay();
        }
    }
    
    /**
     * Evaluate and adjust quality level based on FPS trends
     */
    evaluateQuality(now) {
        if (now - this.lastQualityChange < this.qualityCooldown) return;
        if (this.fpsHistory.length < 5) return;
        
        // Calculate average FPS from recent history
        const recentFps = this.fpsHistory.slice(-10);
        const avgFps = recentFps.reduce((a, b) => a + b, 0) / recentFps.length;
        
        // Flight mode has stricter thresholds (2x factor)
        const criticalThreshold = this.isFlightMode ? this.criticalFps * 1.3 : this.criticalFps;
        const targetThreshold = this.isFlightMode ? this.targetFps * 1.1 : this.targetFps;
        const upgradeThreshold = this.isFlightMode ? 58 : 57;
        
        let newLevel = this.qualityLevel;
        
        if (avgFps < criticalThreshold) {
            // Critical: Drop 2 levels
            newLevel = Math.max(0, this.qualityLevel - 2);
        } else if (avgFps < targetThreshold) {
            // Below target: Drop 1 level
            newLevel = Math.max(0, this.qualityLevel - 1);
        } else if (avgFps > upgradeThreshold && this.qualityLevel < 4) {
            // Very stable high FPS: Try upgrading
            newLevel = Math.min(4, this.qualityLevel + 1);
        }
        
        if (newLevel !== this.qualityLevel) {
            this.setQualityLevel(newLevel);
            this.lastQualityChange = now;
        }
    }
    
    /**
     * Set quality level and apply all optimizations
     */
    setQualityLevel(level) {
        const oldLevel = this.qualityLevel;
        this.qualityLevel = Math.max(0, Math.min(4, level));
        this.activePreset = this.qualityPresets[this.qualityLevel];
        
        console.log(`⚡ Quality: ${this.qualityNames[oldLevel]} → ${this.qualityNames[this.qualityLevel]} (FPS: ${this.fps})`);
        
        this.applyRendererSettings();
        this.applyBloomSettings();
        this.applyShadowSettings();
    }
    
    /**
     * Apply renderer-level settings
     */
    applyRendererSettings() {
        if (!this.renderer) return;
        
        const preset = this.activePreset;
        
        // Pixel ratio - biggest performance impact
        this.renderer.setPixelRatio(preset.pixelRatio);
        
        // Update composer size if exists
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    /**
     * Apply bloom post-processing settings
     */
    applyBloomSettings() {
        if (!this.composer) return;
        
        const preset = this.activePreset;
        
        // Find bloom pass
        for (const pass of this.composer.passes) {
            if (pass.strength !== undefined) { // UnrealBloomPass
                if (preset.bloomEnabled) {
                    pass.enabled = true;
                    pass.strength = preset.bloomStrength;
                    pass.radius = preset.bloomRadius;
                } else {
                    pass.enabled = false;
                }
            }
        }
    }
    
    /**
     * Apply shadow settings
     */
    applyShadowSettings() {
        if (!this.scene) return;
        
        const preset = this.activePreset;
        
        this.scene.traverse((obj) => {
            if (obj.isLight && obj.shadow) {
                obj.castShadow = preset.shadowsEnabled;
            }
            if (obj.isMesh) {
                obj.castShadow = preset.shadowsEnabled;
                obj.receiveShadow = preset.shadowsEnabled;
            }
        });
    }
    
    /**
     * Set flight mode - enables 2x aggressive optimizations
     */
    setFlightMode(enabled) {
        const wasFlightMode = this.isFlightMode;
        this.isFlightMode = enabled;
        
        if (enabled && !wasFlightMode) {
            console.log('⚡ Flight mode optimizations ACTIVATED (2x aggressive)');
            
            // Immediately drop quality by 1 level for flight mode
            if (this.qualityLevel > 1) {
                this.setQualityLevel(this.qualityLevel - 1);
            }
            
            // Reset cooldown so it can adapt quickly
            this.lastQualityChange = performance.now() - this.qualityCooldown + 1000;
        } else if (!enabled && wasFlightMode) {
            console.log('⚡ Flight mode optimizations DEACTIVATED');
            
            // Try to restore quality
            if (this.qualityLevel < 3) {
                this.setQualityLevel(this.qualityLevel + 1);
            }
            this.lastQualityChange = performance.now() - this.qualityCooldown + 1000;
        }
    }
    
    /**
     * Check if a non-critical update should be skipped this frame
     * Used for things like space dust animation, star twinkle, etc.
     * @param {string} type - 'dust', 'stars', 'meteors', 'particles'
     * @returns {boolean} true if should update this frame
     */
    shouldUpdate(type) {
        const preset = this.activePreset;
        // In flight mode, skip even more aggressively (2x factor)
        const flightMultiplier = this.isFlightMode ? 2 : 1;
        
        switch (type) {
            case 'stars':
                return (this.frameNumber % (preset.starUpdateFrequency * flightMultiplier)) === 0;
            case 'dust':
                return (this.frameNumber % (preset.dustUpdateFrequency * flightMultiplier)) === 0;
            case 'particles':
                return (this.frameNumber % Math.max(1, flightMultiplier)) === 0;
            case 'meteors':
                return (this.frameNumber % Math.max(1, flightMultiplier)) === 0;
            case 'moonOrbits':
                // During flight, update moon orbits less frequently
                return (this.frameNumber % (this.isFlightMode ? 3 : 1)) === 0;
            default:
                return true;
        }
    }
    
    /**
     * Get maximum allowed particle count based on quality
     */
    getMaxParticles() {
        const flightMultiplier = this.isFlightMode ? 0.5 : 1;
        return Math.floor(this.activePreset.maxParticles * flightMultiplier);
    }
    
    /**
     * Get maximum allowed meteor count
     */
    getMaxMeteors() {
        return this.isFlightMode ? 
            Math.max(1, this.activePreset.maxMeteors - 1) : 
            this.activePreset.maxMeteors;
    }
    
    /**
     * Get meteor trail length
     */
    getTrailLength() {
        return this.isFlightMode ? 
            Math.floor(this.activePreset.meteorTrailLength * 0.5) : 
            this.activePreset.meteorTrailLength;
    }
    
    /**
     * Get recommended geometry segments for planet spheres
     * @param {string} context - 'planet', 'moon', 'atmosphere', 'ring'
     */
    getSegments(context) {
        const level = this.qualityLevel;
        const flight = this.isFlightMode;
        
        switch (context) {
            case 'planet':
                if (flight) return [24, 32, 40, 48, 56][level];
                return [32, 40, 48, 56, 64][level];
            case 'moon':
                if (flight) return [12, 16, 20, 24, 32][level];
                return [16, 24, 32, 40, 48][level];
            case 'atmosphere':
                if (flight) return [12, 16, 20, 24, 28][level];
                return [16, 20, 24, 28, 32][level];
            case 'ring':
                if (flight) return [32, 48, 64, 80, 96][level];
                return [48, 64, 80, 96, 128][level];
            case 'meteor':
                return [4, 6, 8, 12, 16][level];
            default:
                return [16, 24, 32, 48, 64][level];
        }
    }
    
    /**
     * Check if an object is within a reasonable distance to be worth rendering
     * Useful for flight mode distance culling
     * @param {THREE.Vector3} objectPos - Object position
     * @param {THREE.Vector3} cameraPos - Camera position
     * @param {number} maxDistance - Max render distance
     */
    isInRenderDistance(objectPos, cameraPos, maxDistance = 2000) {
        const dist = objectPos.distanceToSquared(cameraPos);
        // In flight mode, cull more aggressively
        const effectiveMax = this.isFlightMode ? maxDistance * 0.7 : maxDistance;
        return dist < (effectiveMax * effectiveMax);
    }
    
    /**
     * Perform frustum culling check for objects
     * @param {THREE.Object3D} object 
     */
    isInFrustum(object) {
        if (!this.camera) return true;
        
        // Use Three.js built-in frustum check
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(matrix);
        
        if (object.geometry && object.geometry.boundingSphere) {
            return frustum.intersectsSphere(object.geometry.boundingSphere);
        }
        
        return true;
    }
    
    /**
     * Render with optimizations - use this instead of direct render
     */
    render() {
        if (!this.renderer) return;
        
        const preset = this.activePreset;
        
        if (preset.bloomEnabled && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Create performance stats display
     */
    createStatsDisplay() {
        this.statsElement = document.createElement('div');
        this.statsElement.id = 'perf-stats';
        this.statsElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #00ff88;
            padding: 8px 12px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 99999;
            border-radius: 6px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            pointer-events: none;
            line-height: 1.5;
            min-width: 140px;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(this.statsElement);
    }
    
    /**
     * Update stats display
     */
    updateStatsDisplay() {
        if (!this.statsElement) return;
        
        const color = this.fps >= 55 ? '#00ff88' : (this.fps >= 35 ? '#ffaa00' : '#ff4444');
        const flightLabel = this.isFlightMode ? ' ✈️' : '';
        
        this.statsElement.innerHTML = `
            <span style="color:${color}">⚡ ${this.fps} FPS</span>${flightLabel}<br>
            <span style="color:#88aaff">Quality: ${this.qualityNames[this.qualityLevel]}</span><br>
            <span style="color:#aaa">PR: ${this.activePreset.pixelRatio.toFixed(2)}x | Bloom: ${this.activePreset.bloomEnabled ? 'ON' : 'OFF'}</span>
        `;
    }
    
    /**
     * Toggle stats visibility
     */
    toggleStats() {
        if (this.statsElement) {
            this.showStats = !this.showStats;
            this.statsElement.style.opacity = this.showStats ? '1' : '0';
        }
    }
    
    /**
     * Get current quality info
     */
    getInfo() {
        return {
            fps: this.fps,
            quality: this.qualityNames[this.qualityLevel],
            level: this.qualityLevel,
            flightMode: this.isFlightMode,
            preset: { ...this.activePreset }
        };
    }
    
    /**
     * Clean up
     */
    dispose() {
        if (this.statsElement) {
            this.statsElement.remove();
            this.statsElement = null;
        }
        this.fpsHistory = [];
    }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();
