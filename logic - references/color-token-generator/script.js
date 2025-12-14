/*
 * Color Token Generator Logic
 * Handles mixing colors and DOM updates
 */

const elements = {
    input: document.getElementById('primaryColor'),
    label: document.getElementById('colorLabel'),
    tintsGrid: document.getElementById('tintsGrid'),
    shadesGrid: document.getElementById('shadesGrid'),
    neutralLightGrid: document.getElementById('neutralLightGrid'),
    neutralDarkGrid: document.getElementById('neutralDarkGrid'),
    baseCard: document.getElementById('baseCard'),
};

const percentages = [5, 20, 30, 40, 50, 60, 70, 80, 90];

// Initialize
function init() {
    renderPalette(elements.input.value);

    elements.input.addEventListener('input', (e) => {
        renderPalette(e.target.value);
    });

    setupCollapsibles();
    createToast();
}

function setupCollapsibles() {
    document.querySelectorAll('.group-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.parentElement;
            group.classList.toggle('collapsed');
        });
    });
}

// Core Logic
function renderPalette(hexColor) {
    // Update Label and Base
    elements.label.textContent = hexColor;
    updateCard(elements.baseCard, hexColor, 'Base', '100%');

    // Generate and Render Tints (lighter)
    elements.tintsGrid.innerHTML = '';
    percentages.forEach(percent => {
        const tint = mixColors(hexColor, '#FFFFFF', percent);
        const card = createColorCard(tint, `+${percent}% White`, percent);
        elements.tintsGrid.appendChild(card);
    });

    // Generate and Render Shades (darker)
    elements.shadesGrid.innerHTML = '';
    percentages.forEach(percent => {
        const shade = mixColors(hexColor, '#000000', percent);
        const card = createColorCard(shade, `+${percent}% Black`, percent);
        elements.shadesGrid.appendChild(card);
    });

    // Get HSL values from primary color for neutrals
    const hsl = hexToHsl(hexColor);
    const neutralBase = hslToHex(hsl.h, 5, hsl.l); // Same hue, 5% saturation

    // Generate and Render Neutral Light tones
    elements.neutralLightGrid.innerHTML = '';
    percentages.forEach(percent => {
        const neutralLight = mixColors(neutralBase, '#FFFFFF', percent);
        const card = createColorCard(neutralLight, `+${percent}% White`, percent);
        elements.neutralLightGrid.appendChild(card);
    });

    // Generate and Render Neutral Dark tones
    elements.neutralDarkGrid.innerHTML = '';
    percentages.forEach(percent => {
        const neutralDark = mixColors(neutralBase, '#000000', percent);
        const card = createColorCard(neutralDark, `+${percent}% Black`, percent);
        elements.neutralDarkGrid.appendChild(card);
    });
}

function createColorCard(hex, label, percent) {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.onclick = () => copyToClipboard(hex);

    card.innerHTML = `
        <div class="color-swatch" style="background-color: ${hex}"></div>
        <div class="color-info">
            <span class="color-value">${hex}</span>
            <span class="color-name">${label}</span>
        </div>
    `;
    return card;
}

function updateCard(cardElement, hex, label) {
    cardElement.querySelector('.color-swatch').style.backgroundColor = hex;
    cardElement.querySelector('.color-value').textContent = hex;
    cardElement.onclick = () => copyToClipboard(hex);
}

// Color Utilities
function mixColors(color1, color2, weight) {
    // Convert hex to rgb
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    // Weight is percentage of color2
    const p = weight / 100;
    const w = 2 * p - 1;
    const a = 0; // alpha support can be added later

    const w1 = ((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1;
    const w2 = 1 - w1;

    // Simple linear interpolation
    // Standard "mix" logic often creates 'weight' amount of color2
    // So 10% mix means 90% original, 10% new.

    const r = Math.round(c1.r * (1 - p) + c2.r * p);
    const g = Math.round(c1.g * (1 - p) + c2.g * p);
    const b = Math.round(c1.b * (1 - p) + c2.b * p);

    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
    };
    return rgbToHex(f(0), f(8), f(4));
}

// UI Utilities
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${text} to clipboard!`);
    });
}

function createToast() {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'toast';
    document.body.appendChild(toast);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
}

// Start
init();
