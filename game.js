import { COLS, ROWS, BLOCK_SIZE, COLORS, SHAPES, TETROMINOES } from './tetrominoes.js';

// Game Board
let board = [];
let score = 0;
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
    // Draw board
    mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                mainCtx.fillStyle = COLORS[value];
                mainCtx.fillRect(x, y, 1, 1);
                mainCtx.strokeStyle = '#333'; // Block outline
                mainCtx.lineWidth = 0.05;
                mainCtx.strokeRect(x, y, 1, 1);
            }
        });
    });

    // Draw current piece
    drawPiece(currentPiece, mainCtx);
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
        clearLines();
        spawnNewPiece();
        spawnNextPiece();
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
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell > 0)) {
            linesCleared++;
            board.splice(r, 1); // Remove the row
            board.unshift(Array(COLS).fill(0)); // Add an empty row at the top
            r++; // Re-check the current row index as rows shifted
        }
    }
    if (linesCleared > 0) {
        // Update score based on lines cleared (example: 100 per line, bonus for more)
        score += linesCleared * 100 * linesCleared; // e.g. 1 line = 100, 2 lines = 400, 3 = 900, 4 = 1600
        updateScoreDisplay();
    }
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

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        movePiece(0, 1); // Move piece down automatically
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Keyboard controls will be in main.js
