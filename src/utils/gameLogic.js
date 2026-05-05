// src/utils/gameLogic.js
const BOARD_SIZE = 24;

export const createEmptyBoard = () => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
};

const getOpponent = (player) => (player === 'X' ? 'O' : 'X');

// Check win with "Chặn 2 đầu không thắng" rule
export const checkWin = (board, row, col, player) => {
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal \
    [1, -1]  // Diagonal /
  ];

  const opponent = getOpponent(player);

  for (let [dr, dc] of directions) {
    let count = 1;
    let blockedEnds = 0;

    // Check forward
    let r1 = row + dr;
    let c1 = col + dc;
    while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
      count++;
      r1 += dr;
      c1 += dc;
    }
    if (r1 < 0 || r1 >= BOARD_SIZE || c1 < 0 || c1 >= BOARD_SIZE || board[r1][c1] === opponent) {
      blockedEnds++;
    }

    // Check backward
    let r2 = row - dr;
    let c2 = col - dc;
    while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
      count++;
      r2 -= dr;
      c2 -= dc;
    }
    if (r2 < 0 || r2 >= BOARD_SIZE || c2 < 0 || c2 >= BOARD_SIZE || board[r2][c2] === opponent) {
      blockedEnds++;
    }

    // Rule: 5 in a row wins, BUT if exactly 5 and blocked at both ends, it's NOT a win.
    if (count >= 5) {
      if (count === 5 && blockedEnds === 2) {
        // Blocked at both ends -> not a win yet
        continue;
      }
      return { winner: player, direction: [dr, dc], start: [r2 + dr, c2 + dc], end: [r1 - dr, c1 - dc] };
    }
  }

  return null;
};

// AI Logic: Greedy Heuristic Approach
// Evaluates a line for a given player and returns a score
const evaluateLine = (count, blockedEnds) => {
  if (count >= 5) return blockedEnds === 2 ? 0 : 10000000;
  if (count === 4) return blockedEnds === 0 ? 1000000 : (blockedEnds === 1 ? 100000 : 0);
  if (count === 3) return blockedEnds === 0 ? 50000 : (blockedEnds === 1 ? 10000 : 0);
  if (count === 2) return blockedEnds === 0 ? 5000 : (blockedEnds === 1 ? 1000 : 0);
  if (count === 1) return blockedEnds === 0 ? 500 : (blockedEnds === 1 ? 100 : 0);
  return 0;
};

const evaluateCell = (board, row, col, player) => {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  const opponent = getOpponent(player);
  let totalScore = 0;

  for (let [dr, dc] of directions) {
    let count = 1;
    let blockedEnds = 0;

    let r1 = row + dr;
    let c1 = col + dc;
    while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && board[r1][c1] === player) {
      count++;
      r1 += dr;
      c1 += dc;
    }
    if (r1 < 0 || r1 >= BOARD_SIZE || c1 < 0 || c1 >= BOARD_SIZE || board[r1][c1] === opponent) {
      blockedEnds++;
    }

    let r2 = row - dr;
    let c2 = col - dc;
    while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === player) {
      count++;
      r2 -= dr;
      c2 -= dc;
    }
    if (r2 < 0 || r2 >= BOARD_SIZE || c2 < 0 || c2 >= BOARD_SIZE || board[r2][c2] === opponent) {
      blockedEnds++;
    }

    totalScore += evaluateLine(count, blockedEnds);
  }
  return totalScore;
};

export const getBestMove = (board, aiPlayer) => {
  let bestScore = -1;
  let bestMoves = [];
  const humanPlayer = getOpponent(aiPlayer);

  // Check if board is empty
  let isEmpty = true;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        isEmpty = false;
        break;
      }
    }
    if (!isEmpty) break;
  }

  // If empty, play in the center
  if (isEmpty) {
    return { r: Math.floor(BOARD_SIZE / 2), c: Math.floor(BOARD_SIZE / 2) };
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) {
        // Optimize: only evaluate cells that are within 2 steps of an existing piece
        let hasNeighbor = false;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = r + dr;
            let nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== null) {
              hasNeighbor = true;
              break;
            }
          }
          if (hasNeighbor) break;
        }

        if (!hasNeighbor) continue;

        const attackScore = evaluateCell(board, r, c, aiPlayer);
        const defendScore = evaluateCell(board, r, c, humanPlayer);

        // Slightly favor defense to block human winning moves
        const cellScore = attackScore + defendScore * 1.05;

        if (cellScore > bestScore) {
          bestScore = cellScore;
          bestMoves = [{ r, c }];
        } else if (cellScore === bestScore) {
          bestMoves.push({ r, c });
        }
      }
    }
  }

  // Pick random among the best moves to add variety
  if (bestMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
  }

  return null; // Should not happen unless board is full
};
