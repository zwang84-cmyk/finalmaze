// Character positioning and movement system
// Character positioned inside maze border with correct coordinate system

const characterCanvas = document.getElementById('character');
const characterCtx = characterCanvas.getContext('2d');
const mazeContainer = document.getElementById('maze-container');

// Character size
const characterSize = 30;
const moveSpeed = 5;

// Character position in maze image coordinates
// (50, 50) is inside the top-left corridor of the maze
let charX = 50;
let charY = 50;

// Maze rendering information
let mazeImgWidth = 0;
let mazeImgHeight = 0;
let mazeScale = 1;
let mazeOffsetX = 0;
let mazeOffsetY = 0;

// Images
let processedCharacter = null;
let mazePixels = null;
let imagesReady = false;

// Keyboard state
const keys = {};

// Load maze image for collision detection and positioning
const mazeImg = new Image();
mazeImg.onload = () => {
    mazeImgWidth = mazeImg.width;
    mazeImgHeight = mazeImg.height;

    // Create offscreen canvas for collision detection
    const offscreen = document.createElement('canvas');
    offscreen.width = mazeImgWidth;
    offscreen.height = mazeImgHeight;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(mazeImg, 0, 0);
    mazePixels = ctx;

    // Calculate maze rendering position
    calculateMazePosition();

    // Position character
    updateCharacterPosition();

    checkReady();
};
mazeImg.src = 'finalmaze/finalmaze/maze.png';

// Load and process character image
const charImg = new Image();
charImg.onload = () => {
    characterCanvas.width = characterSize;
    characterCanvas.height = characterSize;

    // Process image to remove black background
    const temp = document.createElement('canvas');
    temp.width = charImg.width;
    temp.height = charImg.height;
    const tempCtx = temp.getContext('2d');
    tempCtx.drawImage(charImg, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, temp.width, temp.height);
    const data = imageData.data;

    // Flood fill from edges to remove outer black
    const visited = new Set();

    function isBlack(x, y) {
        const i = (y * temp.width + x) * 4;
        return data[i] < 50 && data[i+1] < 50 && data[i+2] < 50;
    }

    function floodFill(x, y) {
        const stack = [[x, y]];
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            if (cx < 0 || cx >= temp.width || cy < 0 || cy >= temp.height) continue;

            const key = cy * temp.width + cx;
            if (visited.has(key)) continue;
            if (!isBlack(cx, cy)) continue;

            visited.add(key);
            const i = (cy * temp.width + cx) * 4;
            data[i + 3] = 0; // Make transparent

            stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
    }

    // Flood fill from all edges
    for (let x = 0; x < temp.width; x++) {
        floodFill(x, 0);
        floodFill(x, temp.height - 1);
    }
    for (let y = 0; y < temp.height; y++) {
        floodFill(0, y);
        floodFill(temp.width - 1, y);
    }

    tempCtx.putImageData(imageData, 0, 0);
    processedCharacter = temp;

    // Draw character
    characterCtx.clearRect(0, 0, characterSize, characterSize);
    characterCtx.drawImage(processedCharacter, 0, 0, characterSize, characterSize);

    checkReady();
};
charImg.src = 'finalmaze/finalmaze/character.png';

// Calculate where maze renders in container
function calculateMazePosition() {
    const containerW = mazeContainer.offsetWidth;
    const containerH = mazeContainer.offsetHeight;

    // Calculate scale for background-size: contain
    const scaleX = containerW / mazeImgWidth;
    const scaleY = containerH / mazeImgHeight;
    mazeScale = Math.min(scaleX, scaleY);

    // Calculate offset for background-position: center
    const renderedW = mazeImgWidth * mazeScale;
    const renderedH = mazeImgHeight * mazeScale;
    mazeOffsetX = (containerW - renderedW) / 2;
    mazeOffsetY = (containerH - renderedH) / 2;
}

// Convert maze coordinates to container coordinates
function mazeToContainer(mx, my) {
    return {
        x: mazeOffsetX + (mx * mazeScale),
        y: mazeOffsetY + (my * mazeScale)
    };
}

// Update character's visual position
function updateCharacterPosition() {
    const pos = mazeToContainer(charX, charY);
    characterCanvas.style.left = pos.x + 'px';
    characterCanvas.style.top = pos.y + 'px';
}

// Check if position is a wall
function isWall(mx, my) {
    if (!mazePixels) return true;

    // Check bounds
    if (mx < 0 || my < 0 || mx + characterSize >= mazeImgWidth || my + characterSize >= mazeImgHeight) {
        return true;
    }

    // Sample points around character
    const samples = [
        [mx, my],
        [mx + characterSize, my],
        [mx, my + characterSize],
        [mx + characterSize, my + characterSize],
        [mx + characterSize/2, my + characterSize/2]
    ];

    for (let [x, y] of samples) {
        if (x < 0 || y < 0 || x >= mazeImgWidth || y >= mazeImgHeight) return true;

        const pixel = mazePixels.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        if (pixel[0] < 50 && pixel[1] < 50 && pixel[2] < 50) {
            return true;
        }
    }

    return false;
}

// Handle movement
function handleMovement() {
    if (!imagesReady) return;

    let newX = charX;
    let newY = charY;

    if (keys['w']) newY -= moveSpeed;
    if (keys['s']) newY += moveSpeed;
    if (keys['a']) newX -= moveSpeed;
    if (keys['d']) newX += moveSpeed;

    // Only move if not hitting wall
    if (!isWall(newX, newY)) {
        charX = newX;
        charY = newY;
        updateCharacterPosition();
    }
}

// Keyboard listeners on window
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    if (imagesReady) {
        calculateMazePosition();
        updateCharacterPosition();
    }
});

// Check if both images are ready
function checkReady() {
    if (processedCharacter && mazePixels) {
        imagesReady = true;
        gameLoop();
    }
}

// Game loop
function gameLoop() {
    handleMovement();
    requestAnimationFrame(gameLoop);
}
