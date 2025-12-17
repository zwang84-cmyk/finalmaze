// Maze Game with Fixed Background Image
// The maze.png is loaded once and never modified

class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusElement = document.getElementById('status');

        // Game state
        this.gameStarted = false;
        this.gameWon = false;
        this.gameLost = false;

        // Player properties
        this.player = {
            x: 50,  // Starting position (will be adjusted after maze loads)
            y: 50,
            size: 20,
            speed: 3
        };

        // Images - the maze is NEVER regenerated or modified
        this.images = {
            maze: null,          // Fixed background - NEVER changes
            character: null,
            start: null,
            fail: null,
            rightway: null,
            wrongway: null
        };

        // Lighting effect
        this.lightRadius = 100;
        this.showFullMaze = false;

        // Track which images are loaded
        this.imagesLoaded = 0;
        this.totalImages = 6;

        // Setup
        this.setupControls();
        this.loadImages();
    }

    loadImages() {
        const imagePaths = {
            maze: 'finalmaze/finalmaze/maze.png',
            character: 'finalmaze/finalmaze/character.png',
            start: 'finalmaze/finalmaze/start.png',
            fail: 'finalmaze/finalmaze/fail.png',
            rightway: 'finalmaze/finalmaze/rightway.png',
            wrongway: 'finalmaze/finalmaze/wrongway.png'
        };

        for (let [key, path] of Object.entries(imagePaths)) {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                this.imagesLoaded++;

                // When maze image loads, set canvas size to match
                if (key === 'maze') {
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    // Set starting position near top-left of maze
                    this.player.x = 50;
                    this.player.y = 50;
                }

                if (this.imagesLoaded === this.totalImages) {
                    this.startGame();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${path}`);
                this.statusElement.textContent = `Error loading ${key} image`;
            };
            img.src = path;
        }
    }

    setupControls() {
        // Keyboard controls
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            // Prevent arrow keys from scrolling
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }

            // Toggle full maze view with Space
            if (e.key === ' ') {
                this.showFullMaze = !this.showFullMaze;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    startGame() {
        this.gameStarted = true;
        this.statusElement.textContent = 'Navigate the maze! Press SPACE to toggle light';
        this.gameLoop();
    }

    restart() {
        this.player.x = 50;
        this.player.y = 50;
        this.gameWon = false;
        this.gameLost = false;
        this.showFullMaze = false;
        this.statusElement.textContent = 'Navigate the maze! Press SPACE to toggle light';
    }

    handleMovement() {
        if (this.gameWon || this.gameLost) return;

        const prevX = this.player.x;
        const prevY = this.player.y;

        // Handle WASD and Arrow keys
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.y += this.player.speed;
        }

        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.size, this.player.y));

        // Check collision with maze walls
        if (this.checkWallCollision(this.player.x, this.player.y)) {
            // Revert movement
            this.player.x = prevX;
            this.player.y = prevY;
        }

        // Check win condition (near bottom-right corner with arrow)
        if (this.player.x > this.canvas.width - 100 && this.player.y > this.canvas.height - 100) {
            this.gameWon = true;
            this.statusElement.textContent = 'You Won! Press Restart to play again.';
        }
    }

    checkWallCollision(x, y) {
        // Sample points around the player to check for black walls
        const samples = [
            [x, y],                                          // Top-left
            [x + this.player.size, y],                      // Top-right
            [x, y + this.player.size],                      // Bottom-left
            [x + this.player.size, y + this.player.size],  // Bottom-right
            [x + this.player.size/2, y + this.player.size/2] // Center
        ];

        for (let [sx, sy] of samples) {
            const pixel = this.ctx.getImageData(sx, sy, 1, 1).data;
            // Check if pixel is black (wall) - threshold for near-black colors
            if (pixel[0] < 50 && pixel[1] < 50 && pixel[2] < 50) {
                return true;
            }
        }

        return false;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ALWAYS draw the FIXED maze background - NEVER modified
        if (this.images.maze) {
            this.ctx.drawImage(this.images.maze, 0, 0);
        }

        // Apply lighting effect if not showing full maze
        if (!this.showFullMaze) {
            // Create darkness overlay
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Create light around player
            this.ctx.globalCompositeOperation = 'destination-out';
            const gradient = this.ctx.createRadialGradient(
                this.player.x + this.player.size/2,
                this.player.y + this.player.size/2,
                0,
                this.player.x + this.player.size/2,
                this.player.y + this.player.size/2,
                this.lightRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                this.player.x + this.player.size/2 - this.lightRadius,
                this.player.y + this.player.size/2 - this.lightRadius,
                this.lightRadius * 2,
                this.lightRadius * 2
            );

            this.ctx.restore();
        }

        // Draw character
        if (this.images.character) {
            this.ctx.drawImage(
                this.images.character,
                this.player.x - 10,
                this.player.y - 10,
                this.player.size + 20,
                this.player.size + 20
            );
        } else {
            // Fallback if character image not loaded
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        }

        // Draw win/lose overlays
        if (this.gameWon && this.images.rightway) {
            this.ctx.globalAlpha = 0.9;
            this.ctx.drawImage(
                this.images.rightway,
                this.canvas.width / 2 - 100,
                this.canvas.height / 2 - 100,
                200,
                200
            );
            this.ctx.globalAlpha = 1.0;
        }

        if (this.gameLost && this.images.wrongway) {
            this.ctx.globalAlpha = 0.9;
            this.ctx.drawImage(
                this.images.wrongway,
                this.canvas.width / 2 - 100,
                this.canvas.height / 2 - 100,
                200,
                200
            );
            this.ctx.globalAlpha = 1.0;
        }
    }

    gameLoop() {
        this.handleMovement();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new MazeGame();
});
