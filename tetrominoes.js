export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30; // Size of each block in pixels

export const COLORS = [
    null, // 0 is empty
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF',  // Z
    '#FFFFFF'  // 8 - Animation color (white)
];

export const SHAPES = {
    'I': {
        colorIndex: 1,
        rotations: [
            [[1, 1, 1, 1]], // Rotation 0
            [[1], [1], [1], [1]], // Rotation 1
            [[1, 1, 1, 1]], // Rotation 2 (same as 0)
            [[1], [1], [1], [1]]  // Rotation 3 (same as 1)
        ]
    },
    'J': {
        colorIndex: 2,
        rotations: [
            [[0, 1], [0, 1], [1, 1]],
            [[1, 0, 0], [1, 1, 1]],
            [[1, 1], [1, 0], [1, 0]],
            [[1, 1, 1], [0, 0, 1]]
        ]
    },
    'L': {
        colorIndex: 3,
        rotations: [
            [[1, 0], [1, 0], [1, 1]],
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1], [0, 1], [0, 1]],
            [[0, 0, 1], [1, 1, 1]]
        ]
    },
    'O': {
        colorIndex: 4,
        rotations: [
            [[1, 1], [1, 1]] // O shape has only one rotation state
        ]
    },
    'S': {
        colorIndex: 5,
        rotations: [
            [[0, 1, 1], [1, 1, 0]],
            [[1, 0], [1, 1], [0, 1]]
        ]
    },
    'T': {
        colorIndex: 6,
        rotations: [
            [[0, 1, 0], [1, 1, 1]],
            [[1, 0], [1, 1], [1, 0]],
            [[1, 1, 1], [0, 1, 0]],
            [[0, 1], [1, 1], [0, 1]]
        ]
    },
    'Z': {
        colorIndex: 7,
        rotations: [
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1], [1, 1], [1, 0]]
        ]
    }
};

export const TETROMINOES = Object.keys(SHAPES); // ['I', 'J', 'L', 'O', 'S', 'T', 'Z']
