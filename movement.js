// Character movement with correct coordinate system
// Character positioned INSIDE the maze image, accounting for centered background

const characterCanvas = document.getElementById('character');
const characterCtx = characterCanvas.getContext('2d');
const mazeContainer = document.getElementById('maze-container');

// Character properties
const characterSize = 30;
const moveSpeed = 5;

// Maze rendering info - where the maze actually appears in the container
let mazeRenderX = 0;
let mazeRenderY = 0;
let mazeRenderWidth = 0;
let mazeRenderHeight = 0;

// Character position in maze coordinates (relative to maze image)
let characterMazeX = 50; // Start inside the top-left entrance corridor
let characterMazeY = 50;

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
            data[idx + 3] = 0;

            // Check neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    // Flood fill from edges to remove outer black
    floodFillBlack(0, 0);
    floodFillBlack(width - 1, 0);
    floodFillBlack(0, height - 1);
    floodFillBlack(width - 1, height - 1);

    for (let x = 0; x < width; x++) {
        floodFillBlack(x, 0);
        floodFillBlack(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        floodFillBlack(0, y);
        floodFillBlack(width - 1, y);
    }

    tempCtx.putImageData(imageData, 0, 0);
    processedCharacterData = tempCanvas;

    drawCharacter();
};
characterImage.src = 'finalmaze/finalmaze/character.png';

// Load maze for collision detection and positioning
mazeImage.onload = () => {
    offscreenCanvas.width = mazeImage.width;
    offscreenCanvas.height = mazeImage.height;
    offscreenCtx.drawImage(mazeImage, 0, 0);

    // Calculate where the maze actually renders in the container
    calculateMazeRenderPosition();

    // Position character initially
    updateCharacterScreenPosition();

    mazeLoaded = true;
    gameLoop();
};
mazeImage.src = 'finalmaze/finalmaze/maze.png';

// Calculate where the maze image actually appears in the container
function calculateMazeRenderPosition() {
    const containerWidth = mazeContainer.offsetWidth;
    const containerHeight = mazeContainer.offsetHeight;
    const mazeWidth = mazeImage.width;
    const mazeHeight = mazeImage.height;

    // Calculate scale factor for 'contain'
    const scaleX = containerWidth / mazeWidth;
    const scaleY = containerHeight / mazeHeight;
    const scale = Math.min(scaleX, scaleY);

    // Calculate rendered dimensions
    mazeRenderWidth = mazeWidth * scale;
    mazeRenderHeight = mazeHeight * scale;

    // Calculate position for 'center'
    mazeRenderX = (containerWidth - mazeRenderWidth) / 2;
    mazeRenderY = (containerHeight - mazeRenderHeight) / 2;
}

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

// Update character's screen position based on maze coordinates
function updateCharacterScreenPosition() {
    const containerWidth = mazeContainer.offsetWidth;
    const containerHeight = mazeContainer.offsetHeight;

    // Recalculate in case window was resized
    calculateMazeRenderPosition();

    // Convert maze coordinates to screen coordinates
    const scale = mazeRenderWidth / mazeImage.width;
    const screenX = mazeRenderX + (characterMazeX * scale);
    const screenY = mazeRenderY + (characterMazeY * scale);

    characterCanvas.style.left = screenX + 'px';
    characterCanvas.style.top = screenY + 'px';
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

// Check if position collides with wall in maze coordinates
function isWall(mazeX, mazeY) {
    if (!mazeLoaded) return false;

    // Check bounds
    if (mazeX < 0 || mazeY < 0 ||
        mazeX + characterSize >= mazeImage.width ||
        mazeY + characterSize >= mazeImage.height) {
        return true;
    }

    // Sample multiple points around character
    const samples = [
        [mazeX, mazeY],
        [mazeX + characterSize, mazeY],
        [mazeX, mazeY + characterSize],
        [mazeX + characterSize, mazeY + characterSize],
        [mazeX + characterSize / 2, mazeY + characterSize / 2]
    ];

    for (let [sx, sy] of samples) {
        if (sx < 0 || sy < 0 || sx >= mazeImage.width || sy >= mazeImage.height) {
            return true;
        }

        const pixel = offscreenCtx.getImageData(Math.floor(sx), Math.floor(sy), 1, 1).data;
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

    let newMazeX = characterMazeX;
    let newMazeY = characterMazeY;

    // WASD movement in maze coordinates
    if (keys['w']) {
        newMazeY -= moveSpeed;
    }
    if (keys['s']) {
        newMazeY += moveSpeed;
    }
    if (keys['a']) {
        newMazeX -= moveSpeed;
    }
    if (keys['d']) {
        newMazeX += moveSpeed;
    }

    // Check collision
    if (!isWall(newMazeX, newMazeY)) {
        characterMazeX = newMazeX;
        characterMazeY = newMazeY;
        updateCharacterScreenPosition();
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (mazeLoaded) {
        updateCharacterScreenPosition();
    }
});

// Game loop
function gameLoop() {
    updatePosition();
    requestAnimationFrame(gameLoop);
}
