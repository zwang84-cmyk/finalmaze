# Maze Game

A browser-based maze game that uses a fixed maze image as the background with interactive gameplay elements layered on top.

## Features

- **Fixed Maze Background**: The maze image (`finalmaze/finalmaze/maze.png`) is loaded once and never modified, regenerated, or redrawn
- **Character Movement**: Navigate through the maze using arrow keys or WASD
- **Dynamic Lighting**: Toggle between full view and flashlight mode with the spacebar
- **Collision Detection**: Walls prevent player movement through obstacles
- **Win Condition**: Reach the bottom-right corner to complete the maze

## How to Play

1. Open `index.html` in a web browser
2. Use **Arrow Keys** or **WASD** to move your character
3. Press **SPACE** to toggle between full maze view and flashlight mode
4. Navigate to the exit at the bottom-right corner
5. Click **Restart** to play again

## Technical Implementation

The game uses HTML5 Canvas to render:
- The original maze.png as a fixed, unchangeable background layer
- Character sprite overlaid on top
- Dynamic lighting effects using radial gradients
- Collision detection by sampling pixel colors from the maze

### Key Design Principle

The maze image is treated as a **static asset** that is:
- ✅ Loaded once at game start
- ✅ Drawn as-is to the canvas background
- ✅ Never modified, cropped, resized, or regenerated
- ✅ Used as the base layer for all visual effects

All game interactions, characters, lighting, and effects are layered on top of this fixed maze image.

## Files

- `index.html` - Game interface and canvas element
- `game.js` - Game logic, rendering, and player controls
- `styles.css` - Visual styling and responsive design
- `finalmaze/finalmaze/maze.png` - The fixed maze background image (never modified)
- `finalmaze/finalmaze/character.png` - Player character sprite
- `finalmaze/finalmaze/rightway.png` - Victory indicator
- `finalmaze/finalmaze/wrongway.png` - Failure indicator

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas:
- Chrome/Edge
- Firefox
- Safari
