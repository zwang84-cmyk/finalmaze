// Character movement with wall collision detection
// The maze background remains untouched - only used for collision checking

const character = document.getElementById('character');
let characterX = 50;
let characterY = 50;
const moveSpeed = 5;
const characterSize = 30;

// Create offscreen canvas to check maze pixels for collision
const mazeImage = new Image();
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
let mazeLoaded = false;

// Load maze image for collision detection only
mazeImage.onload = () => {
    offscreenCanvas.width = mazeImage.width;
    offscreenCanvas.height = mazeImage.height;
    offscreenCtx.drawImage(mazeImage, 0, 0);
    mazeLoaded = true;
};
mazeImage.src = 'finalmaze/finalmaze/maze.png';

// Track pressed keys
const keys = {};

// Keyboard input
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Prevent scrolling with WASD
    if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Check if position collides with wall
function isWall(x, y) {
    if (!mazeLoaded) return false;

    // Check if coordinates are within maze bounds
    if (x < 0 || y < 0 || x >= mazeImage.width || y >= mazeImage.height) {
        return true; // Treat out of bounds as wall
    }

    // Sample multiple points around the character to detect walls
    const samples = [
        [x, y],                                    // Top-left
        [x + characterSize, y],                    // Top-right
        [x, y + characterSize],                    // Bottom-left
        [x + characterSize, y + characterSize],    // Bottom-right
        [x + characterSize/2, y + characterSize/2] // Center
    ];

    for (let [sx, sy] of samples) {
        if (sx < 0 || sy < 0 || sx >= mazeImage.width || sy >= mazeImage.height) {
            return true;
        }

        const pixel = offscreenCtx.getImageData(sx, sy, 1, 1).data;
        // Black pixels are walls (RGB values below threshold)
        if (pixel[0] < 50 && pixel[1] < 50 && pixel[2] < 50) {
            return true;
        }
    }

    return false;
}

// Update character position
function updatePosition() {
    if (!mazeLoaded) return;

    let newX = characterX;
    let newY = characterY;

    // Handle WASD movement
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

    // Check collision and update position if valid
    if (!isWall(newX, newY)) {
        characterX = newX;
        characterY = newY;
        character.style.left = characterX + 'px';
        character.style.top = characterY + 'px';
    }
}

// Game loop
function gameLoop() {
    updatePosition();
    requestAnimationFrame(gameLoop);
}

// Start when maze is loaded
mazeImage.onload = () => {
    offscreenCanvas.width = mazeImage.width;
    offscreenCanvas.height = mazeImage.height;
    offscreenCtx.drawImage(mazeImage, 0, 0);
    mazeLoaded = true;
    gameLoop();
};
