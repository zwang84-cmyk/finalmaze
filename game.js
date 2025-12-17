// Game state
const game = {
    canvas: null,
    ctx: null,
    character: {
        x: 50,
        y: 50,
        width: 30,
        height: 40,
        speed: 3,
        img: new Image()
    },
    maze: {
        img: new Image(),
        imageData: null
    },
    keys: {},
    gameOver: false,
    won: false,
    exitZone: { x: 1300, y: 720, width: 50, height: 40 }
};

// Initialize the game
function init() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d', { willReadFrequently: true });

    // Set canvas size
    game.canvas.width = 1366;
    game.canvas.height = 768;

    // Load character image
    game.character.img.src = 'finalmaze/finalmaze/character.png';

    // Load maze image for collision detection
    game.maze.img.src = 'finalmaze/finalmaze/maze.png';
    game.maze.img.onload = () => {
        // Create a temporary canvas to read maze pixel data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = game.canvas.width;
        tempCanvas.height = game.canvas.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.drawImage(game.maze.img, 0, 0, tempCanvas.width, tempCanvas.height);
        game.maze.imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        // Start game loop
        gameLoop();
    };

    // Set up keyboard controls
    document.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
        e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
        e.preventDefault();
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', restartGame);
}

// Check if a position collides with maze walls
function isWall(x, y) {
    if (!game.maze.imageData) return false;

    // Boundary check
    if (x < 0 || x >= game.canvas.width || y < 0 || y >= game.canvas.height) {
        return true;
    }

    const index = (Math.floor(y) * game.canvas.width + Math.floor(x)) * 4;

    // Check if pixel is black (wall) - RGB values close to 0
    const r = game.maze.imageData.data[index];
    const g = game.maze.imageData.data[index + 1];
    const b = game.maze.imageData.data[index + 2];

    // If the pixel is dark (black = wall), return true
    return (r < 50 && g < 50 && b < 50);
}

// Check if character can move to new position
function canMove(newX, newY) {
    const checkPoints = [
        { x: newX + 5, y: newY + 5 },           // Top-left
        { x: newX + game.character.width - 5, y: newY + 5 },  // Top-right
        { x: newX + 5, y: newY + game.character.height - 5 }, // Bottom-left
        { x: newX + game.character.width - 5, y: newY + game.character.height - 5 }, // Bottom-right
        { x: newX + game.character.width / 2, y: newY + 5 },  // Top-center
        { x: newX + game.character.width / 2, y: newY + game.character.height - 5 }, // Bottom-center
        { x: newX + 5, y: newY + game.character.height / 2 }, // Left-center
        { x: newX + game.character.width - 5, y: newY + game.character.height / 2 }  // Right-center
    ];

    for (let point of checkPoints) {
        if (isWall(point.x, point.y)) {
            return false;
        }
    }

    return true;
}

// Check if character reached the exit
function checkWin() {
    const charCenterX = game.character.x + game.character.width / 2;
    const charCenterY = game.character.y + game.character.height / 2;

    return charCenterX >= game.exitZone.x &&
           charCenterX <= game.exitZone.x + game.exitZone.width &&
           charCenterY >= game.exitZone.y &&
           charCenterY <= game.exitZone.y + game.exitZone.height;
}

// Update game state
function update() {
    if (game.gameOver) return;

    let newX = game.character.x;
    let newY = game.character.y;

    // Handle movement
    if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) {
        newY -= game.character.speed;
    }
    if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) {
        newY += game.character.speed;
    }
    if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
        newX -= game.character.speed;
    }
    if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
        newX += game.character.speed;
    }

    // Check if movement is valid
    if (canMove(newX, newY)) {
        game.character.x = newX;
        game.character.y = newY;
    } else if (canMove(newX, game.character.y)) {
        // Try moving only horizontally
        game.character.x = newX;
    } else if (canMove(game.character.x, newY)) {
        // Try moving only vertically
        game.character.y = newY;
    }

    // Check win condition
    if (checkWin()) {
        game.gameOver = true;
        game.won = true;
        showMessage('Congratulations! You won!', '#4CAF50');
    }
}

// Render the game
function render() {
    // Clear canvas
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

    // Draw character
    if (game.character.img.complete) {
        game.ctx.drawImage(
            game.character.img,
            game.character.x,
            game.character.y,
            game.character.width,
            game.character.height
        );
    }

    // Draw exit indicator (subtle glow effect)
    if (!game.gameOver) {
        game.ctx.save();
        game.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        game.ctx.shadowBlur = 20;
        game.ctx.shadowColor = 'rgba(76, 175, 80, 0.8)';
        game.ctx.fillRect(game.exitZone.x, game.exitZone.y, game.exitZone.width, game.exitZone.height);
        game.ctx.restore();
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Show message to player
function showMessage(text, color) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.style.backgroundColor = color || 'rgba(0, 0, 0, 0.8)';
    messageEl.classList.add('show');

    document.getElementById('restart-btn').style.display = 'block';
}

// Restart the game
function restartGame() {
    game.character.x = 50;
    game.character.y = 50;
    game.gameOver = false;
    game.won = false;
    game.keys = {};

    document.getElementById('message').classList.remove('show');
    document.getElementById('restart-btn').style.display = 'none';
}

// Start the game when page loads
window.addEventListener('load', init);
