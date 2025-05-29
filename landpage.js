function generateTileShadows(tile, maxDistance = 6, step = 2, unit = 'vw') {
    const shadows = [];
    for (let x = -maxDistance; x <= maxDistance; x += step) {
        for (let y = -maxDistance; y <= maxDistance; y += step) {
            if (x === 0 && y === 0) continue;
            const distance = Math.sqrt(x * x + y * y);
            const blur = -(distance * 0.075).toFixed(2);
            shadows.push(`${x}${unit} ${y}${unit} 0 ${blur}${unit}`);
        }
    }
    tile.style.setProperty('--shadows', shadows.join(', '));
}

function buildGrid(rows = 20, cols = 30) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let i = 0; i < rows * cols; i++) {
        const tile = document.createElement('div');
        tile.className = 'card__grid-effect-tile';
        generateTileShadows(tile);
        grid.appendChild(tile);
    }
}

function setupMouseTrail(gridSelector = '#grid') {
    const grid = document.querySelector(gridSelector);
    const tiles = grid.querySelectorAll('.card__grid-effect-tile');

    grid.addEventListener('mousemove', e => {
        const rect = grid.getBoundingClientRect();
        // const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const color = getOppositeColorFromGradient(
            mouseY,
            rect.height,
            '#A9C9FF',
            '#DCBBFF'
        );

        tiles.forEach(tile => {
            const tileRect = tile.getBoundingClientRect();
            const tileX = tileRect.left + tileRect.width / 2;
            const tileY = tileRect.top + tileRect.height / 2;
            const dist = Math.hypot(tileX - e.clientX, tileY - e.clientY);

            if (dist < 100) {
                tile.classList.add('active');
                tile.style.setProperty('--shadow-color', color);

                clearTimeout(tile._fadeTimeout);
                tile._fadeTimeout = setTimeout(() => {
                    tile.classList.remove('active');
                }, 500);
            }
        });
    });
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#',''), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
}

function interpolateColor(c1, c2, factor) {
    return c1.map((v, i) => Math.round(v + (c2[i] - v) * factor));
}

function invertColor(rgb) {
    return rgb.map(v => 255 - v);
}

function getOppositeColorFromGradient(mouseY, height, topHex, bottomHex) {
    const top = hexToRgb(topHex);
    const bottom = hexToRgb(bottomHex);
    const factor = Math.min(Math.max(mouseY / height, 0), 1);
    const interpolated = interpolateColor(top, bottom, factor);
    const inverted = invertColor(interpolated);
    return rgbToHex(...inverted);
}

// inizializza e ricostruisci al resize
// window.addEventListener('DOMContentLoaded', () => buildGrid());
window.addEventListener('resize', () => buildGrid());

window.addEventListener('DOMContentLoaded', () => {
    buildGrid(); // tua funzione di generazione tile
    setupMouseTrail(); // nuova funzione effetto scia
});