# HTML5 Canvas Tetris Game

This is a basic implementation of the classic game Tetris, built using JavaScript and the HTML5 Canvas API.

## Features

- Standard tetromino shapes (I, O, T, L, J, S, Z)
- Piece rotation
- Horizontal piece movement
- Piece dropping (soft and hard drop)
- Automatic line clearing
- Score tracking
- Display of the upcoming piece
- Responsive design for different screen sizes
- Keyboard controls

## Setup and How to Play

1.  **Clone the repository or download the files.**
    If you have git installed, you can clone it:
    ```bash
    git clone <repository_url> # Replace <repository_url> with the actual URL
    cd <repository_directory>
    ```
    Otherwise, download `index.html`, `style.css`, `main.js`, `game.js`, and `tetrominoes.js` into the same directory.

2.  **Open `index.html` in your web browser.**
    Simply navigate to the directory where you saved the files and open `index.html` with any modern web browser (e.g., Chrome, Firefox, Safari, Edge).

3.  **Play the game!**

    *   **Left Arrow / A Key**: Move piece left
    *   **Right Arrow / D Key**: Move piece right
    *   **Down Arrow / S Key**: Move piece down (soft drop)
    *   **Up Arrow / W Key**: Rotate piece
    *   **Space Bar**: Drop piece instantly (hard drop)

## Code Structure

-   `index.html`: The main HTML file that sets up the game page, including the canvas elements for the game board and the next piece preview, and the score display.
-   `style.css`: Contains all the CSS rules for styling the game, making it responsive and visually appealing.
-   `main.js`: Entry point for the JavaScript game logic. It initializes the game and handles keyboard inputs. It imports modules from `game.js`.
-   `game.js`: Contains the core game logic, including managing the game state, piece movements, collision detection, line clearing, scoring, and rendering the game on the main canvas and the next piece preview. It imports constants and shapes from `tetrominoes.js`.
-   `tetrominoes.js`: Defines the shapes and properties of the different tetromino pieces (I, O, T, L, J, S, Z), including their colors and rotation patterns. It also includes constants for the game grid like number of rows, columns, and block size.

## Future Improvements (Optional)

-   Game Over screen with restart option
-   Level progression (speed increases)
-   Sound effects
-   Persistent high scores (using localStorage)
-   Touch controls for mobile devices

Enjoy the game!

## Running Tests

This project uses Jest for unit testing the line clearing logic.

1.  **Install Dependencies:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install
    ```
    This will install Jest and any other development dependencies listed in `package.json`.

2.  **Run Tests:**
    To execute the unit tests, run the following command from the project's root directory:
    ```bash
    npm test
    ```
    Jest will run the tests located in the `/tests` directory and output the results to your console.
