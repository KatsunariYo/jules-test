import { COLS, ROWS, BLOCK_SIZE, COLORS, SHAPES, TETROMINOES } from './tetrominoes.js';

// Game Board
let board = [];
let score = 0;
let linesToClearAnimation = []; // Stores objects like { index: y, startTime: 0 }
let isAnimatingLineClear = false;
const LINE_CLEAR_ANIMATION_DURATION = 400; // ms
let currentPiece;
let nextPiece;

// Canvas contexts
let mainCtx;
let nextCtx;

// DOM Elements
let scoreElement;

export function initGame(mainCanvas, nextCanvas, scoreEl) {
    mainCtx = mainCanvas.getContext('2d');
    nextCtx = nextCanvas.getContext('2d');
    scoreElement = scoreEl;

    mainCanvas.width = COLS * BLOCK_SIZE;
    mainCanvas.height = ROWS * BLOCK_SIZE;
    nextCanvas.width = 4 * BLOCK_SIZE; // Assuming max next piece width is 4 blocks
    nextCanvas.height = 4 * BLOCK_SIZE; // Assuming max next piece height is 4 blocks

    mainCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
    nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

    resetGame();
    gameLoop();
}

function resetGame() {
    board = createEmptyBoard();
    score = 0;
    updateScoreDisplay();
    spawnNewPiece();
    spawnNextPiece();
    draw();
}

function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function spawnNewPiece() {
    currentPiece = nextPiece || getRandomPiece();
    currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;

    if (collides(currentPiece, board)) {
        // Game Over
        resetGame(); // Or implement a proper game over screen
        alert("Game Over! Score: " + score);
    }
}

function spawnNextPiece() {
    nextPiece = getRandomPiece();
    drawNextPiece();
}

function getRandomPiece() {
    const type = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    const pieceData = SHAPES[type];
    return {
        type: type,
        shape: pieceData.rotations[0], // Default to first rotation
        colorIndex: pieceData.colorIndex,
        rotationIndex: 0,
        x: 0,
        y: 0
    };
}

// Drawing functions
function draw() {
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);

    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                if (isAnimatingLineClear && value === 8) { // Line marked for clearing
                    // Simple flashing effect: alternate color rapidly
                    const elapsed = lastTime - linesToClearAnimation[0].startTime; // Assuming all lines start animation at the same time for simplicity
                    const flashState = Math.floor(elapsed / 100) % 2; // Change state every 100ms
                    mainCtx.fillStyle = flashState === 0 ? COLORS[value] : '#DDDDDD'; // Flash between white (COLORS[8]) and light gray
                } else {
                    mainCtx.fillStyle = COLORS[value];
                }
                mainCtx.fillRect(x, y, 1, 1);
                mainCtx.strokeStyle = '#333';
                mainCtx.lineWidth = 0.05;
                mainCtx.strokeRect(x, y, 1, 1);
            }
        });
    });

    // Draw current piece (if not animating, or if you want piece to be visible on top)
    // For now, let's assume the current piece is not drawn or is handled appropriately
    // if it's part of the cleared line scenario (which it shouldn't be, as it's merged first).
    if (currentPiece && !isAnimatingLineClear) { // Potentially hide piece or handle differently during animation
        drawPiece(currentPiece, mainCtx);
    } else if (currentPiece && isAnimatingLineClear) {
        // Decide if you want to draw the falling piece during line clear animation.
        // For simplicity, let's draw it. It should not overlap with the lines being cleared.
        drawPiece(currentPiece, mainCtx);
    }
    // The nextPiece is drawn separately and should be unaffected.
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCtx.canvas.width, nextCtx.canvas.height);
    if (nextPiece) {
        // Center the piece in the next piece canvas
        const shape = nextPiece.shape;
        const pieceWidth = shape[0].length;
        const pieceHeight = shape.length;
        const offsetX = (4 - pieceWidth) / 2;
        const offsetY = (4 - pieceHeight) / 2;
        drawPiece({ ...nextPiece, x: offsetX, y: offsetY }, nextCtx);
    }
}

function drawPiece(piece, ctx) {
    ctx.fillStyle = COLORS[piece.colorIndex];
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                ctx.fillRect(piece.x + x, piece.y + y, 1, 1);
                ctx.strokeStyle = '#333'; // Block outline
                ctx.lineWidth = 0.05;
                ctx.strokeRect(piece.x + x, piece.y + y, 1, 1);
            }
        });
    });
}

// Movement and Collision
export function movePiece(dx, dy) {
    if (!currentPiece) return;
    const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    if (!collides(newPiece, board)) {
        currentPiece = newPiece;
    } else if (dy > 0) { // Trying to move down but collided
        mergePieceToBoard();
        const linesClearedCount = clearLines(); // Call clearLines
        if (!isAnimatingLineClear) { // If no lines are being animated, spawn next piece immediately
            spawnNewPiece();
            spawnNextPiece();
        }
        // If isAnimatingLineClear is true, spawning will be handled after animation.
    }
    draw();
}

export function rotatePiece() {
    if (!currentPiece) return;
    const pieceData = SHAPES[currentPiece.type];
    let newRotationIndex = (currentPiece.rotationIndex + 1) % pieceData.rotations.length;
    let newShape = pieceData.rotations[newRotationIndex];

    const newPiece = { ...currentPiece, shape: newShape, rotationIndex: newRotationIndex };

    // Wall kick logic (basic)
    let offsetX = 0;
    if (collides(newPiece, board)) {
        offsetX = newPiece.x < COLS / 2 ? 1 : -1; // Try moving away from wall
        if (collides({ ...newPiece, x: newPiece.x + offsetX }, board)) {
            offsetX = newPiece.x < COLS / 2 ? 2 : -2; // Try moving further
             if (collides({ ...newPiece, x: newPiece.x + offsetX }, board)) {
                offsetX = 0; // Can't rotate
            }
        }
    }

    if (offsetX !== 0) {
        newPiece.x += offsetX;
    }


    if (!collides(newPiece, board)) {
        currentPiece = newPiece;
    }
    draw();
}

export function dropPiece() {
    if (!currentPiece) return;
    while (!collides({ ...currentPiece, y: currentPiece.y + 1 }, board)) {
        currentPiece.y++;
        score += 1; // Small score for soft drop
    }
    movePiece(0, 1); // Final move to lock and check for game over if needed
    updateScoreDisplay();
}

function collides(piece, gameBoard) {
    const { shape, x, y } = piece;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 0) {
                continue;
            }
            const newX = x + c;
            const newY = y + r;

            // Check boundaries
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
                return true;
            }
            // Check board (ensure newY is not negative before accessing board)
            if (newY >= 0 && gameBoard[newY] && gameBoard[newY][newX] !== 0) {
                return true;
            }
        }
    }
    return false;
}

function mergePieceToBoard() {
    if (!currentPiece) return;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                if (currentPiece.y + y >= 0) { // Ensure piece is within board vertically
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.colorIndex;
                }
            }
        });
    });
}

function clearLines() {
    if (isAnimatingLineClear) return 0; // Don't check for new lines if already animating

    let linesFound = [];
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell > 0 && cell !== 8)) { // Assuming 8 is a new "clearing" color index
            linesFound.push(r);
        }
    }

    if (linesFound.length > 0) {
        isAnimatingLineClear = true;
        linesToClearAnimation = linesFound.map(index => ({ index, startTime: lastTime })); // Store current time for animation start

        // Mark lines for animation (e.g., change their color temporarily)
        linesFound.forEach(rowIndex => {
            for (let c = 0; c < COLS; c++) {
                board[rowIndex][c] = 8; // Use a special color/value for animating lines (e.g., white or a distinct color)
                                     // Ensure COLORS array has an entry for index 8, e.g., 'white'
            }
        });
        // The actual removal and scoring will happen after the animation.
        // We return the number of lines found so that other logic (like piece locking) knows lines were hit.
        return linesFound.length;
    }
    return 0;
}

function updateScoreDisplay() {
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

// Game Loop
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // Milliseconds (1 second)

function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (isAnimatingLineClear) {
        // Assuming linesToClearAnimation is not empty if isAnimatingLineClear is true
        if (linesToClearAnimation.length > 0 && (time - linesToClearAnimation[0].startTime > LINE_CLEAR_ANIMATION_DURATION)) {
            finishLineClearing();
        }
    } else { // Only process game logic like piece dropping if not animating
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            movePiece(0, 1); // Move piece down automatically
            dropCounter = 0;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Add this new function in game.js
function finishLineClearing() {
    let linesClearedThisTurn = 0; // Renamed to avoid confusion with any higher scope variable if present

    // Sort lines by index in descending order (e.g., [19, 18, 17])
    // This ensures that splicing higher rows doesn't affect the indices of lower rows yet to be processed.
    linesToClearAnimation.sort((a, b) => b.index - a.index);

    for (let i = 0; i < linesToClearAnimation.length; i++) {
        const originalRowIndex = linesToClearAnimation[i].index;
        
        // Remove the line at its original index. Since we sorted descending,
        // removing line 19 doesn't change index of line 18 when its turn comes.
        board.splice(originalRowIndex, 1);
        
        // Add a new empty row at the top of the board
        board.unshift(Array(COLS).fill(0));
        
        linesClearedThisTurn++;
    }

    if (linesClearedThisTurn > 0) {
        score += linesClearedThisTurn * 100 * linesClearedThisTurn;
        updateScoreDisplay();
    }

    isAnimatingLineClear = false;
    linesToClearAnimation = []; // Clear the array for the next cycle

    // Resume game
    spawnNewPiece();
    spawnNextPiece();
    dropCounter = 0; // Reset drop counter for the new piece
}

// Keyboard controls will be in main.js
