# Maze Game

A browser-based maze game with a fixed maze background and character navigation.

## Features

- **Fixed Maze Background**: The maze image (`finalmaze/maze.png`) is used as an unchanging visual background
- **Character Movement**: Control the character using arrow keys or WASD
- **Collision Detection**: The game reads the maze image pixels to detect walls and prevent movement through them
- **Layered Rendering**: All game elements (character, effects, UI) are rendered on top of the static maze background
- **Win Condition**: Navigate to the exit (bottom-right corner with the arrow) to win

## How to Play

1. Open `finalmaze/index.html` in a web browser
2. Use **Arrow Keys** or **WASD** to move the character
3. Navigate through the white paths (avoid black walls)
4. Reach the exit zone in the bottom-right corner to win
5. Click "Restart Game" to play again

## Technical Implementation

### Architecture

- **HTML Layer** (`index.html`): Game container structure
- **CSS Layer** (`style.css`): Fixed maze background using `background-image`
- **Canvas Layer** (`game.js`): Character and interactive elements rendered on top

### Maze Background

The maze background is implemented as a fixed CSS background:

```css
#maze-background {
    background-image: url('finalmaze/maze.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
}
```

**Important**: The maze image is never modified, redrawn, or regenerated. All game logic layers on top of this static background.

### Collision Detection

The game loads the maze image into memory and reads pixel data to determine wall positions:
- Black pixels (RGB < 50) = walls (impassable)
- White pixels = paths (walkable)

### Files

- `finalmaze/index.html` - Main game page
- `finalmaze/style.css` - Styling and maze background
- `finalmaze/game.js` - Game logic and rendering
- `finalmaze/finalmaze/maze.png` - The fixed maze background image
- `finalmaze/finalmaze/character.png` - Character sprite

## Browser Compatibility

Works in all modern browsers with HTML5 Canvas support.
