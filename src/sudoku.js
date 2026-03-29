/**
 * Sudoku generation and validation utilities.
 */

/** Check whether placing `num` at (row, col) is valid. */
function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

/** Shuffle an array in place (Fisher-Yates). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Fill the board using backtracking with randomised digit order. */
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of digits) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Count the number of solutions for `board` (stops after 2 to check
 * uniqueness efficiently).
 */
function countSolutions(board, limit = 2) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            count += countSolutions(board, limit - count);
            board[row][col] = 0;
            if (count >= limit) return count;
          }
        }
        return count;
      }
    }
  }
  return 1; // Fully filled
}

/** Deep-copy a 2-D board. */
function copyBoard(board) {
  return board.map((row) => [...row]);
}

/**
 * Number of cells to remove for each difficulty level.
 * Easy   → 35 cells removed  (~43 %)
 * Medium → 46 cells removed  (~57 %)
 * Hard   → 52 cells removed  (~64 %)
 */
const REMOVALS = { easy: 35, medium: 46, hard: 52 };

/**
 * Generate a sudoku puzzle.
 *
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ puzzle: number[][], solution: number[][] }}
 *   `puzzle` contains 0 for empty cells; `solution` is the full board.
 */
export function generateSudoku(difficulty = 'medium') {
  // Build a complete, random solution
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution);

  const puzzle = copyBoard(solution);
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]),
  );

  let removed = 0;
  const target = REMOVALS[difficulty] ?? REMOVALS.medium;

  for (const [row, col] of cells) {
    if (removed >= target) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Keep the puzzle only if it still has a unique solution
    const test = copyBoard(puzzle);
    if (countSolutions(test) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

/**
 * Check whether the user's filled board matches the solution.
 *
 * @param {number[][]} board   User's current board (0 = empty)
 * @param {number[][]} solution
 * @returns {boolean}
 */
export function isSolved(board, solution) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
