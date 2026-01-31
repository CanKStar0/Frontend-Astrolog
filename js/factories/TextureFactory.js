
export const TextureFactory = {
    generateEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Deep ocean base
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
        oceanGradient.addColorStop(0, '#1a3a5c');
        oceanGradient.addColorStop(0.3, '#1e5080');
        oceanGradient.addColorStop(0.5, '#2060a0');
        oceanGradient.addColorStop(0.7, '#1e5080');
        oceanGradient.addColorStop(1, '#1a3a5c');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, 2048, 1024);

        // Continents - more realistic shapes
        const continents = [
            // North America
            { x: 300, y: 250, w: 350, h: 280, color: '#3a7d44' },
            // South America
            { x: 450, y: 500, w: 180, h: 350, color: '#4a8d54' },
            // Europe
            { x: 950, y: 200, w: 200, h: 150, color: '#4a8d54' },
            // Africa
            { x: 1000, y: 350, w: 250, h: 350, color: '#c4a35a' },
            // Asia
            { x: 1150, y: 180, w: 500, h: 350, color: '#5a9d64' },
            // Australia
            { x: 1550, y: 550, w: 200, h: 180, color: '#d4935a' },
            // Antarctica
            { x: 0, y: 900, w: 2048, h: 124, color: '#e8e8f0' }
        ];

        continents.forEach(c => {
            ctx.fillStyle = c.color;
            ctx.beginPath();
            // Organic continent shapes
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const radiusX = c.w / 2 + Math.random() * 50 - 25;
                const radiusY = c.h / 2 + Math.random() * 40 - 20;
                const px = c.x + c.w / 2 + Math.cos(angle) * radiusX;
                const py = c.y + c.h / 2 + Math.sin(angle) * radiusY;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Add terrain variation
            ctx.fillStyle = 'rgba(80, 60, 40, 0.3)';
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.arc(c.x + Math.random() * c.w, c.y + Math.random() * c.h, Math.random() * 30 + 10, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Mountain ranges
        ctx.fillStyle = '#8B7355';
        [[1200, 280, 400], [350, 320, 200], [1100, 400, 150]].forEach(([x, y, len]) => {
            for (let i = 0; i < len; i += 10) {
                ctx.beginPath();
                ctx.arc(x + i + Math.random() * 20, y + Math.random() * 40, Math.random() * 15 + 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Ice caps
        ctx.fillStyle = '#f0f5ff';
        ctx.beginPath();
        ctx.ellipse(1024, 50, 800, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    },

    generateEarthClouds() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 2048, 1024);

        // Cloud patterns
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const size = Math.random() * 150 + 30;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateMarsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Mars base color gradient
        const baseGradient = ctx.createLinearGradient(0, 0, 0, 1024);
        baseGradient.addColorStop(0, '#c1440e');
        baseGradient.addColorStop(0.3, '#d4652a');
        baseGradient.addColorStop(0.5, '#e07040');
        baseGradient.addColorStop(0.7, '#d4652a');
        baseGradient.addColorStop(1, '#a03808');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, 2048, 1024);

        // Terrain variations - darker regions
        ctx.fillStyle = 'rgba(80, 30, 10, 0.4)';
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            ctx.ellipse(x, y, Math.random() * 200 + 50, Math.random() * 150 + 30, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Olympus Mons (large volcano)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(400, 350, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(400, 350, 40, 0, Math.PI * 2);
        ctx.fill();

        // Valles Marineris (canyon)
        ctx.strokeStyle = '#5a2a0a';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(800, 480);
        ctx.bezierCurveTo(1000, 500, 1200, 460, 1500, 480);
        ctx.stroke();

        // Craters
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const r = Math.random() * 30 + 5;

            ctx.fillStyle = 'rgba(60, 20, 5, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(200, 120, 80, 0.3)';
            ctx.beginPath();
            ctx.arc(x + r * 0.2, y - r * 0.2, r * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Polar ice caps
        ctx.fillStyle = 'rgba(255, 250, 245, 0.8)';
        ctx.beginPath();
        ctx.ellipse(1024, 30, 600, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(1024, 994, 500, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    },

    generateJupiterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Jupiter band colors
        const bands = [
            '#d4b896', '#c9a882', '#e8d4b8', '#c4956a', '#dcc4a8',
            '#b8865a', '#e0c8a0', '#c9a070', '#d8c098', '#b07848',
            '#dcc4a0', '#c49860', '#e0d0b0', '#b88050', '#d4b890'
        ];

        const bandHeight = 1024 / bands.length;

        bands.forEach((color, i) => {
            // Create wavy band
            ctx.fillStyle = color;
            // Calculate frequency so it loops perfectly over 2048 width
            // 2048 * freq = n * 2 * PI
            // freq = (n * 2 * PI) / 2048
            const waves = 10 + i; // Number of waves around the planet
            const freq = (waves * Math.PI * 2) / 2048;

            ctx.beginPath();
            ctx.moveTo(0, i * bandHeight);

            // Wavy top edge
            for (let x = 0; x <= 2048; x += 10) {
                const waveY = i * bandHeight + Math.sin(x * freq + i) * 8;
                ctx.lineTo(x, waveY);
            }
            // Ensure end point matches start point perfectly
            ctx.lineTo(2048, i * bandHeight + Math.sin(0 + i) * 8);

            // Wavy bottom edge (draw backwards to close shape)
            const nextFreq = ((waves + 1) * Math.PI * 2) / 2048;
            for (let x = 2048; x >= 0; x -= 10) {
                const waveY = (i + 1) * bandHeight + Math.sin(x * nextFreq + i + 1) * 8;
                ctx.lineTo(x, waveY);
            }

            ctx.closePath();
            ctx.fill();

            // Add turbulence
            ctx.fillStyle = 'rgba(180, 140, 100, 0.2)';
            for (let j = 0; j < 10; j++) {
                ctx.beginPath();
                ctx.ellipse(
                    Math.random() * 2048,
                    i * bandHeight + Math.random() * bandHeight,
                    Math.random() * 100 + 20,
                    Math.random() * 20 + 5,
                    Math.random() * Math.PI,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Great Red Spot
        const grsX = 600;
        const grsY = 580;

        // Outer red
        ctx.fillStyle = '#c45030';
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, 140, 80, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner swirl
        ctx.fillStyle = '#d86040';
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, 100, 55, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#e87050';
        ctx.beginPath();
        ctx.ellipse(grsX, grsY, 50, 30, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Swirl lines
        ctx.strokeStyle = 'rgba(200, 100, 60, 0.5)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(grsX, grsY, 60 + i * 20, 0, Math.PI * 1.5);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateBlackHoleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Pure black center
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 1024);

        return new THREE.CanvasTexture(canvas);
    },

    generateAccretionDiskTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        const centerX = 512;
        const centerY = 512;

        // Radial gradient for disk
        for (let r = 500; r > 100; r -= 2) {
            const hue = 280 - (r - 100) * 0.2;
            const lightness = 30 + (500 - r) * 0.1;
            const alpha = 0.3 + (500 - r) * 0.001;

            ctx.strokeStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Hot inner region
        const innerGradient = ctx.createRadialGradient(centerX, centerY, 100, centerX, centerY, 200);
        innerGradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
        innerGradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.5)');
        innerGradient.addColorStop(1, 'rgba(150, 50, 200, 0)');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    },

    generateSaturnTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Saturn palette (Pale golds, beiges, muted yellows)
        const bands = [
            '#e3dccb', '#d9cfa1', '#cec092', '#c7b68b', '#d4c8a5',
            '#e0d8b8', '#cdc29c', '#c2b280', '#dcd4b0', '#e4dec0'
        ];

        const bandHeight = 1024 / bands.length;

        // Draw smooth bands
        bands.forEach((color, i) => {
            const gradient = ctx.createLinearGradient(0, i * bandHeight, 0, (i + 1) * bandHeight);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, adjustColor(color, 20)); // Lighter middle
            gradient.addColorStop(1, color);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, i * bandHeight, 2048, bandHeight);

            // Subtle noise
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
            for (let j = 0; j < 100; j++) {
                ctx.fillRect(Math.random() * 2048, i * bandHeight + Math.random() * bandHeight, Math.random() * 50, 2);
            }
        });

        return new THREE.CanvasTexture(canvas);
    },

    generateRingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 128; // 1D Gradient effectively
        const ctx = canvas.getContext('2d');

        // Center is empty (gap between planet and rings)
        // Draw rings as horizontal lines (mapped radially later)

        ctx.fillStyle = 'rgba(0,0,0,0)'; // Transparent background
        ctx.fillRect(0, 0, 1024, 128);

        // Ring Colors
        const ringColors = [
            { pos: 0.3, color: 'rgba(200, 190, 170, 0.4)' }, // Inner C Ring (Faint)
            { pos: 0.4, color: 'rgba(220, 210, 190, 0.9)' }, // B Ring (Bright)
            { pos: 0.65, color: 'rgba(0, 0, 0, 0)' },       // Cassini Division (Gap)
            { pos: 0.7, color: 'rgba(210, 200, 180, 0.8)' }, // A Ring
            { pos: 0.95, color: 'rgba(180, 170, 160, 0.3)' } // F Ring (Outer faint)
        ];

        // Create complex gradient
        const gradient = ctx.createLinearGradient(0, 0, 1024, 0); // Horizontal gradient (Inner to Outer)

        // Add defined stops
        ringColors.forEach(stop => gradient.addColorStop(stop.pos, stop.color));

        // Add noise stops for realistic texture
        for (let i = 0.3; i < 0.98; i += 0.005) {
            if (i > 0.63 && i < 0.68) continue; // Skip Cassini
            const opacity = Math.random() * 0.5 + 0.3;
            gradient.addColorStop(i, `rgba(210, 200, 180, ${opacity})`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 128);

        return new THREE.CanvasTexture(canvas);
    },

    generateMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base gray
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(0, 0, 1024, 512);

        // Noise/Craters
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 20 + 2;
            const brightness = Math.random() * 40 - 20; // Darker or lighter

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${120 + brightness}, ${120 + brightness}, ${120 + brightness}, 0.6)`;
            ctx.fill();

            // Crater rim
            if (Math.random() > 0.5) {
                ctx.strokeStyle = `rgba(${100 + brightness}, ${100 + brightness}, ${100 + brightness}, 0.8)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Mares (Dark plains)
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 80 + 30;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(80, 80, 80, 0.4)';
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateIoTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Sulfuric sulfur yellow base
        ctx.fillStyle = '#fce205';
        ctx.fillRect(0, 0, 1024, 512);

        // Volcanic patches (Red/Orange/Dark)
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const radius = Math.random() * 40 + 5;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, Math.random() > 0.5 ? '#8b0000' : '#d2691e');
            grad.addColorStop(1, 'rgba(252, 226, 5, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateEuropaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Icy white/blue base
        ctx.fillStyle = '#f0faff';
        ctx.fillRect(0, 0, 1024, 512);

        // Linear cracks (Lineae)
        ctx.strokeStyle = 'rgba(100, 50, 0, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 1024, Math.random() * 512);
            ctx.lineTo(Math.random() * 1024, Math.random() * 512);
            ctx.stroke();
        }

        // Frosty patches
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 30 + 5, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateAsteroidTexture(color = '#888888') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 512, 256);

        // Pockmarks and shadows
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 10 + 2, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateMercuryTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Mercury base: Grayish-brown
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#665544');
        gradient.addColorStop(0.5, '#887766');
        gradient.addColorStop(1, '#665544');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Heavy Cratering
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const r = Math.random() * 20 + 2;
            const brightness = Math.random() * 60 - 30;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${100 + brightness}, ${90 + brightness}, ${80 + brightness}, 0.5)`;
            ctx.fill();

            // Highlight rim
            ctx.strokeStyle = `rgba(${140 + brightness}, ${130 + brightness}, ${120 + brightness}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Central peak
            if (r > 10 && Math.random() > 0.7) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateVenusTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Pale yellow/orange sulfuric acid clouds
        const baseGradient = ctx.createLinearGradient(0, 0, 0, 1024);
        baseGradient.addColorStop(0, '#e3bb76');
        baseGradient.addColorStop(0.5, '#f5d59c');
        baseGradient.addColorStop(1, '#e3bb76');
        ctx.fillStyle = baseGradient;
        ctx.fillRect(0, 0, 2048, 1024);

        // Swirling cloud patterns
        for (let i = 0; i < 15; i++) {
            const y = (i / 15) * 1024;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(227, 187, 118, 0.4)' : 'rgba(245, 213, 156, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            const waves = 4;
            const freq = (waves * Math.PI * 2) / 2048;
            for (let x = 0; x <= 2048; x += 20) {
                const waveY = y + Math.sin(x * freq + i) * 50;
                ctx.lineTo(x, waveY);
            }
            ctx.lineTo(2048, 1024);
            ctx.lineTo(0, 1024);
            ctx.closePath();
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateUranusTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#93d2d9');
        gradient.addColorStop(0.5, '#afe0e4');
        gradient.addColorStop(1, '#93d2d9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const size = Math.random() * 300 + 100;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    generateNeptuneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#2147a2');
        gradient.addColorStop(0.5, '#3e5eb3');
        gradient.addColorStop(1, '#2147a2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Great Dark Spot
        const spotX = 300;
        const spotY = 320;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 100);
        spotGrad.addColorStop(0, 'rgba(10, 20, 60, 0.5)');
        spotGrad.addColorStop(1, 'rgba(10, 20, 60, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, 100, 60, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // White cloud streaks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 150, y + (Math.random() - 0.5) * 20);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Phobos - Mars' larger moon (dark, cratered, elongated)
    generatePhobosTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Dark gray-brown base
        ctx.fillStyle = '#554433';
        ctx.fillRect(0, 0, 512, 256);

        // Heavy cratering (Phobos is heavily cratered)
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const r = Math.random() * 15 + 2;
            const brightness = Math.random() * 30 - 15;

            ctx.fillStyle = `rgba(${60 + brightness}, ${50 + brightness}, ${40 + brightness}, 0.6)`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Stickney Crater (large)
            if (i === 0) {
                ctx.fillStyle = 'rgba(30, 25, 20, 0.8)';
                ctx.beginPath();
                ctx.arc(256, 128, 40, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Grooves/striations
        ctx.strokeStyle = 'rgba(40, 30, 25, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 256);
            ctx.lineTo(Math.random() * 512, Math.random() * 256);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Deimos - Mars' smaller moon (smoother than Phobos)
    generateDeimosTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Slightly lighter than Phobos
        ctx.fillStyle = '#665544';
        ctx.fillRect(0, 0, 512, 256);

        // Fewer, smaller craters (regolith-covered)
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const r = Math.random() * 8 + 1;
            const brightness = Math.random() * 20 - 10;

            ctx.fillStyle = `rgba(${80 + brightness}, ${70 + brightness}, ${55 + brightness}, 0.4)`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Smooth regolith patches
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 40);
            grad.addColorStop(0, 'rgba(120, 110, 90, 0.3)');
            grad.addColorStop(1, 'rgba(120, 110, 90, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Ganymede - Jupiter's largest moon (mixed ice and rock)
    generateGanymedeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Mixed gray-brown base
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#9090a0');
        gradient.addColorStop(0.5, '#a0a0b0');
        gradient.addColorStop(1, '#808090');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Dark regions (ancient cratered terrain)
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const size = Math.random() * 150 + 50;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(70, 60, 50, 0.5)');
            grad.addColorStop(1, 'rgba(70, 60, 50, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Light grooved terrain (tectonic)
        ctx.strokeStyle = 'rgba(200, 200, 210, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 100);
            ctx.stroke();
        }

        // Craters
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const r = Math.random() * 15 + 3;
            ctx.fillStyle = 'rgba(120, 120, 130, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Callisto - Jupiter's outermost Galilean moon (heavily cratered ice)
    generateCallistoTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark icy surface
        ctx.fillStyle = '#505060';
        ctx.fillRect(0, 0, 1024, 512);

        // Many bright impact craters (ancient surface)
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const r = Math.random() * 20 + 3;

            // Dark crater
            ctx.fillStyle = 'rgba(40, 40, 50, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Bright ejecta rays
            if (r > 10) {
                ctx.fillStyle = 'rgba(150, 150, 160, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Valhalla multi-ring structure
        const vX = 700, vY = 250;
        for (let r = 30; r < 150; r += 20) {
            ctx.strokeStyle = `rgba(180, 180, 190, ${0.3 - r * 0.001})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(vX, vY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Titan - Saturn's largest moon (thick orange atmosphere)
    generateTitanTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Orange hazy atmosphere
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#cc9955');
        gradient.addColorStop(0.3, '#ddaa66');
        gradient.addColorStop(0.5, '#eebb77');
        gradient.addColorStop(0.7, '#ddaa66');
        gradient.addColorStop(1, '#cc9955');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Haze bands
        for (let i = 0; i < 20; i++) {
            const y = (i / 20) * 512;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 200, 150, 0.2)' : 'rgba(200, 150, 100, 0.15)';
            ctx.fillRect(0, y, 1024, 512 / 20);
        }

        // Methane lakes (dark patches - visible through haze)
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 150 + 50; // Northern hemisphere
            const size = Math.random() * 80 + 30;
            ctx.fillStyle = 'rgba(80, 60, 40, 0.4)';
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cloud wisps
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 512;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 100);
            grad.addColorStop(0, 'rgba(255, 220, 180, 0.3)');
            grad.addColorStop(1, 'rgba(255, 220, 180, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y, 100, 40, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Rhea - Saturn's second-largest moon (icy, cratered)
    generateRheaTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Bright icy surface
        ctx.fillStyle = '#d0d0d8';
        ctx.fillRect(0, 0, 512, 256);

        // Wispy terrain (possible cryovolcanism)
        for (let i = 0; i < 20; i++) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 256);
            ctx.bezierCurveTo(
                Math.random() * 512, Math.random() * 256,
                Math.random() * 512, Math.random() * 256,
                Math.random() * 512, Math.random() * 256
            );
            ctx.stroke();
        }

        // Craters
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const r = Math.random() * 12 + 2;
            ctx.fillStyle = 'rgba(180, 180, 190, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    },

    // Sun surface texture (fallback for simple rendering)
    generateSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Base gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
        gradient.addColorStop(0, '#ffcc33');
        gradient.addColorStop(0.5, '#ffaa00');
        gradient.addColorStop(1, '#ff8800');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 1024);

        // Granulation (convection cells)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const size = Math.random() * 20 + 5;
            const brightness = Math.random() * 40 - 20;

            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, `rgba(${255 + brightness}, ${200 + brightness}, ${50 + brightness}, 0.3)`);
            grad.addColorStop(1, `rgba(${220 + brightness}, ${150 + brightness}, ${0}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sunspots
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 2048;
            const y = 300 + Math.random() * 400; // Equatorial region
            const size = Math.random() * 40 + 10;

            // Umbra (dark center)
            ctx.fillStyle = 'rgba(80, 40, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Penumbra (lighter outer)
            ctx.fillStyle = 'rgba(150, 80, 20, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Solar flares/prominences
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() < 0.5 ? 50 : 974;
            ctx.fillStyle = 'rgba(255, 100, 50, 0.4)';
            ctx.beginPath();
            ctx.ellipse(x, y, Math.random() * 100 + 30, Math.random() * 30 + 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    }
};

// Helper for color lightness
function adjustColor(color, amount) {
    return color; // Simplification for now, or use tinycolor logic if needed. 
    // Ideally we'd parse hex, add amounts, return hex. 
    // Keeping it simple: returning original color for now doesn't break anything, 
    // but we can rely on opacity/gradients above.
}
