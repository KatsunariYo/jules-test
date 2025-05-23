import { initGame, movePiece, rotatePiece, dropPiece } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const mainCanvas = document.getElementById('tetris-canvas');
    const nextCanvas = document.getElementById('next-piece-canvas');
    const scoreElement = document.getElementById('score');

    if (!mainCanvas || !nextCanvas || !scoreElement) {
        console.error("Required canvas or score elements not found!");
        return;
    }

    initGame(mainCanvas, nextCanvas, scoreElement);

    // Keyboard Controls
    document.addEventListener('keydown', event => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a': // A for left
                movePiece(-1, 0);
                event.preventDefault(); // Prevent page scrolling
                break;
            case 'ArrowRight':
            case 'd': // D for right
                movePiece(1, 0);
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 's': // S for soft drop
                movePiece(0, 1);
                event.preventDefault();
                break;
            case 'ArrowUp':
            case 'w': // W or Up Arrow for rotation
                rotatePiece();
                event.preventDefault();
                break;
            case ' ': // Space bar for hard drop
                dropPiece();
                event.preventDefault();
                break;
        }
    });
});
