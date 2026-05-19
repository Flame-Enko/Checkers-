const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

const SIZE = 8;
let board = [];
let currentPlayer = 'white';
let selectedCell = null;
let mustCapture = false;
let availableMoves = [];

const directions = {
    white: [[-1, -1], [-1, 1]],
    black: [[1, -1], [1, 1]],
    king: [[-1, -1], [-1, 1], [1, -1], [1, 1]]
};

function createBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < SIZE; c++) {
            if ((r + c) % 2 === 1) board[r][c] = { color: 'black', king: false };
        }
    }

    for (let r = 5; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if ((r + c) % 2 === 1) board[r][c] = { color: 'white', king: false };
        }
    }
}

function renderBoard() {
    boardElement.innerHTML = '';

    mustCapture = hasAnyCapture(currentPlayer);

    if (selectedCell) {
        availableMoves = getMovesForCell(selectedCell.row, selectedCell.col);
        if (mustCapture) availableMoves = availableMoves.filter(m => m.capture);
    } else {
        availableMoves = [];
    }

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const sq = document.createElement('div');
            sq.className = 'square ' + (((r + c) % 2 === 0) ? 'light' : 'dark');
            sq.dataset.row = r; sq.dataset.col = c;
            sq.addEventListener('click', onSquareClick);

            if (selectedCell && selectedCell.row === r && selectedCell.col === c) sq.classList.add('selected');

            const canMove = availableMoves.some(m => m.to.row === r && m.to.col === c);
            if (canMove) sq.classList.add('move');

            const p = board[r][c];
            if (p) {
                const e = document.createElement('div');
                e.className = `piece ${p.color}`;
                if (p.king) e.classList.add('king');
                sq.appendChild(e);
            }

            boardElement.appendChild(sq);
        }
    }

    updateStatus();
}

function onSquareClick(event) {
    const row = Number(event.currentTarget.dataset.row);
    const col = Number(event.currentTarget.dataset.col);
    const piece = board[row][col];

    if (piece && piece.color === currentPlayer) { selectCell(row, col); return; }

    if (selectedCell) {
        const move = availableMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) executeMove(move);
    }
}

function selectCell(row, col) {
    selectedCell = { row, col };
    availableMoves = getMovesForCell(row, col);
    if (mustCapture) availableMoves = availableMoves.filter(m => m.capture);
    renderBoard();
}

function getMovesForCell(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    if (piece.king) return getKingMoves(row, col, piece);

    const moves = [];
    for (const [dr, dc] of directions[piece.color]) {
        const nr = row + dr, nc = col + dc;
        if (!isInside(nr, nc)) continue;
        if (!board[nr][nc] && !mustCapture) {
            moves.push({ from: { row, col }, to: { row: nr, col: nc }, capture: null });
        }
    }

    for (const [dr, dc] of directions.king) {
        const nr = row + dr, nc = col + dc;
        if (!isInside(nr, nc)) continue;
        const tp = board[nr][nc];
        if (!tp || tp.color === piece.color) continue;
        const jr = nr + dr, jc = nc + dc;
        if (isInside(jr, jc) && !board[jr][jc]) {
            moves.push({ from: { row, col }, to: { row: jr, col: jc }, capture: { row: nr, col: nc } });
        }
    }

    return moves;
}

function getKingMoves(row, col, piece) {
    const moves = [];

    for (const [dr, dc] of directions.king) {
        let r = row + dr, c = col + dc;
        let enemy = null;

        while (isInside(r, c)) {
            const cell = board[r][c];

            if (!cell) {
                if (!enemy && !mustCapture) moves.push({ from: { row, col }, to: { row: r, col: c }, capture: null });
                if (enemy) moves.push({ from: { row, col }, to: { row: r, col: c }, capture: enemy });
                r += dr; c += dc; continue;
            }

            if (cell.color === piece.color) break;

            if (!enemy) {
                enemy = { row: r, col: c };
                r += dr; c += dc;
                while (isInside(r, c) && !board[r][c]) {
                    moves.push({ from: { row, col }, to: { row: r, col: c }, capture: enemy });
                    r += dr; c += dc;
                }
            }
            break;
        }
    }

    return moves;
}

function getAllMoves(player) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
        const p = board[r][c];
        if (p && p.color === player) moves.push(...getMovesForCell(r, c));
    }
    return moves;
}

function hasAnyCapture(player) { return getAllMoves(player).some(m => m.capture); }

function executeMove(move) {
    const piece = board[move.from.row][move.from.col];
    board[move.from.row][move.from.col] = null;
    board[move.to.row][move.to.col] = piece;

    if (move.capture) board[move.capture.row][move.capture.col] = null;

    if ((piece.color === 'white' && move.to.row === 0) || (piece.color === 'black' && move.to.row === SIZE - 1)) piece.king = true;

    if (move.capture) {
        const extra = getMovesForCell(move.to.row, move.to.col).filter(m => m.capture);
        if (extra.length > 0) {
            selectedCell = { row: move.to.row, col: move.to.col };
            availableMoves = extra;
            renderBoard();
            return; 
        }
    }

    selectedCell = null; availableMoves = [];
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
    renderBoard();
}

function updateStatus() {
    const playerText = currentPlayer === 'white' ? 'Białe' : 'Czarne';
    const moves = getAllMoves(currentPlayer); 
    if (moves.length === 0) {
        statusElement.textContent = `Zwycięstwo ${currentPlayer === 'white' ? 'czarnych' : 'białych'}!`;
        return;
    }
    statusElement.textContent = `Kolej: ${playerText}${mustCapture ? ' (obowiązkowe bicie)' : ''}`;
}

function isInside(row, col) { return row >= 0 && row < SIZE && col >= 0 && col < SIZE; }

createBoard();
renderBoard();