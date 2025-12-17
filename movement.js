// Character movement with transparent background
// Removes outer black background while preserving internal black details (eyes)

const characterCanvas = document.getElementById('character');
const characterCtx = characterCanvas.getContext('2d');

// Character properties
let characterX = 50;
let characterY = 50;
const characterSize = 30;
const moveSpeed = 5;

// Processed character image (with transparency)
let processedCharacterData = null;

// Maze collision detection
const mazeImage = new Image();
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
let mazeLoaded = false;

// Track pressed keys
const keys = {};

// Load and process character image
const characterImage = new Image();
characterImage.onload = () => {
    // Set canvas size
    characterCanvas.width = characterSize;
    characterCanvas.height = characterSize;

    // Create temporary canvas for processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = characterImage.width;
    tempCanvas.height = characterImage.height;

    // Draw original image
    tempCtx.drawImage(characterImage, 0, 0);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Remove outer black background using flood fill from corners
    // This preserves internal black details (eyes)
    const visited = new Set();
    const width = tempCanvas.width;
    const height = tempCanvas.height;

    function getIndex(x, y) {
        return y * width + x;
    }

    function isBlack(x, y) {
        const idx = (y * width + x) * 4;
        return data[idx] < 50 && data[idx + 1] < 50 && data[idx + 2] < 50;
    }

    function floodFillBlack(startX, startY) {
        const stack = [[startX, startY]];

        while (stack.length > 0) {
            const [x, y] = stack.pop();

            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const index = getIndex(x, y);
            if (visited.has(index)) continue;
            if (!isBlack(x, y)) continue;

            visited.add(index);

            // Make this pixel transparent
            const idx = (y * width + x) * 4;
            data[idx + 3] = 0; // Set alpha to 0

            // Check neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    // Flood fill from all four corners to remove outer black
    floodFillBlack(0, 0);
    floodFillBlack(width - 1, 0);
    floodFillBlack(0, height - 1);
    floodFillBlack(width - 1, height - 1);

    // Also check edges
    for (let x = 0; x < width; x++) {
        floodFillBlack(x, 0);
        floodFillBlack(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        floodFillBlack(0, y);
        floodFillBlack(width - 1, y);
    }

    // Put processed image data back
    tempCtx.putImageData(imageData, 0, 0);

    // Store processed image
    processedCharacterData = tempCanvas;

    // Draw character
    drawCharacter();
};
characterImage.src = 'finalmaze/finalmaze/character.png';

// Load maze for collision detection
mazeImage.onload = () => {
    offscreenCanvas.width = mazeImage.width;
    offscreenCanvas.height = mazeImage.height;
    offscreenCtx.drawImage(mazeImage, 0, 0);
    mazeLoaded = true;
    gameLoop();
};
mazeImage.src = 'finalmaze/finalmaze/maze.png';

// Draw character to canvas
function drawCharacter() {
    if (!processedCharacterData) return;

    characterCtx.clearRect(0, 0, characterCanvas.width, characterCanvas.height);
    characterCtx.drawImage(
        processedCharacterData,
        0, 0,
        processedCharacterData.width,
        processedCharacterData.height,
        0, 0,
        characterSize,
        characterSize
    );
}

// Keyboard input - bound at window level
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    // Prevent scrolling with WASD
    if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
});

// Check if position collides with wall
function isWall(x, y) {
    if (!mazeLoaded) return false;

    // Check bounds
    if (x < 0 || y < 0 || x + characterSize >= mazeImage.width || y + characterSize >= mazeImage.height) {
        return true;
    }

    // Sample multiple points around character
    const samples = [
        [x, y],
        [x + characterSize, y],
        [x, y + characterSize],
        [x + characterSize, y + characterSize],
        [x + characterSize / 2, y + characterSize / 2]
    ];

    for (let [sx, sy] of samples) {
        if (sx < 0 || sy < 0 || sx >= mazeImage.width || sy >= mazeImage.height) {
            return true;
        }

        const pixel = offscreenCtx.getImageData(sx, sy, 1, 1).data;
        // Black pixels are walls
        if (pixel[0] < 50 && pixel[1] < 50 && pixel[2] < 50) {
            return true;
        }
    }

    return false;
}

// Update character position based on keys
function updatePosition() {
    if (!mazeLoaded) return;

    let newX = characterX;
    let newY = characterY;

    // WASD movement
    if (keys['w']) {
        newY -= moveSpeed;
    }
    if (keys['s']) {
        newY += moveSpeed;
    }
    if (keys['a']) {
        newX -= moveSpeed;
    }
    if (keys['d']) {
        newX += moveSpeed;
    }

    // Check collision
    if (!isWall(newX, newY)) {
        characterX = newX;
        characterY = newY;
        characterCanvas.style.left = characterX + 'px';
        characterCanvas.style.top = characterY + 'px';
    }
}

// Game loop
function gameLoop() {
    updatePosition();
    requestAnimationFrame(gameLoop);
}
