document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('colorWheel');
    const root = document.documentElement;

    // Display Elements
    const primaryHexDisplay = document.getElementById('primaryHex');
    const primaryHslDisplay = document.getElementById('primaryHsl');
    const compHexDisplay = document.getElementById('compHex');
    const compHslDisplay = document.getElementById('compHsl');

    let isDragging = false;

    // Center of the wheel (calculated on interaction to handle resize)
    let rect, cx, cy;

    function updateMetrics() {
        rect = wheel.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
    }

    function handleStart(e) {
        isDragging = true;
        updateMetrics();
        handleMove(e); // Update immediately on click
        e.preventDefault(); // Prevent text selection/scrolling
    }

    function handleEnd() {
        isDragging = false;
    }

    function handleMove(e) {
        if (!isDragging) return;

        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate angle
        const dx = clientX - cx;
        const dy = clientY - cy;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Adjust angle so 0 is at top (css 0deg is top? No, rotate 0 starts at top usually, check CSS)
        // Actually, CSS rotate(0deg) is usually top.
        // atan2 returns 0 at 3 o'clock. +90 to align with top.
        angle = angle + 90;

        if (angle < 0) {
            angle += 360;
        }

        updateColor(angle);
    }

    function updateColor(hue) {
        // Normalize hue
        hue = Math.round(hue) % 360;
        const compHue = (hue + 180) % 360;

        // Update CSS Variables
        root.style.setProperty('--primary-h', hue);
        root.style.setProperty('--comp-h', compHue);

        // Update Text Display
        updateText(hue, 100, 50, primaryHexDisplay, primaryHslDisplay);
        updateText(compHue, 100, 50, compHexDisplay, compHslDisplay);
    }

    function updateText(h, s, l, hexEl, hslEl) {
        const hex = hslToHex(h, s, l);
        hexEl.textContent = hex;
        hslEl.textContent = `${h}°, ${s}%, ${l}%`;
    }

    // HSL to Hex helper
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    }

    // Event Listeners
    wheel.addEventListener('mousedown', handleStart);
    wheel.addEventListener('touchstart', handleStart, { passive: false });

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });

    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    // Initial Resize calc
    window.addEventListener('resize', updateMetrics);

    // Initial call
    updateMetrics();
    updateColor(0); // Initialize with Red
});
