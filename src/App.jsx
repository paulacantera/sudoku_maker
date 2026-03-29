import { useState, useCallback } from 'react';
import { generateSudoku, isSolved } from './sudoku';
import './App.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function SudokuCell({ value, isGiven, isSelected, isHighlighted, isError, onClick }) {
  const classes = [
    'cell',
    isGiven ? 'given' : 'editable',
    isSelected ? 'selected' : '',
    isHighlighted ? 'highlighted' : '',
    isError ? 'error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td className={classes} onClick={onClick}>
      {value !== 0 ? value : ''}
    </td>
  );
}

function SudokuBoard({ board, solution, givenCells, selected, onSelect }) {
  return (
    <table className="sudoku-board" role="grid" aria-label="Sudoku board">
      <tbody>
        {board.map((row, r) => (
          <tr key={r}>
            {row.map((val, c) => {
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isHighlighted =
                selected &&
                (selected[0] === r ||
                  selected[1] === c ||
                  (Math.floor(selected[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selected[1] / 3) === Math.floor(c / 3)));
              const isGiven = givenCells[r][c];
              const isError = !isGiven && val !== 0 && val !== solution[r][c];

              return (
                <SudokuCell
                  key={c}
                  value={val}
                  isGiven={isGiven}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isError={isError}
                  onClick={() => !isGiven && onSelect([r, c])}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NumberPad({ onDigit, onErase }) {
  return (
    <div className="number-pad" role="group" aria-label="Number pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button key={n} className="digit-btn" onClick={() => onDigit(n)}>
          {n}
        </button>
      ))}
      <button className="digit-btn erase-btn" onClick={onErase}>
        ✕
      </button>
    </div>
  );
}

function buildGivenCells(puzzle) {
  return puzzle.map((row) => row.map((v) => v !== 0));
}

export default function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [{ puzzle, solution }, setGame] = useState(() => generateSudoku('medium'));
  const [board, setBoard] = useState(() => puzzle.map((r) => [...r]));
  const [givenCells, setGivenCells] = useState(() => buildGivenCells(puzzle));
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);

  const newGame = useCallback(() => {
    const game = generateSudoku(difficulty);
    setGame(game);
    setBoard(game.puzzle.map((r) => [...r]));
    setGivenCells(buildGivenCells(game.puzzle));
    setSelected(null);
    setSolved(false);
  }, [difficulty]);

  const handleDigit = useCallback(
    (num) => {
      if (!selected || solved) return;
      const [r, c] = selected;
      if (givenCells[r][c]) return;

      const next = board.map((row) => [...row]);
      next[r][c] = num;
      setBoard(next);

      if (isSolved(next, solution)) setSolved(true);
    },
    [selected, solved, board, givenCells, solution],
  );

  const handleErase = useCallback(() => {
    if (!selected || solved) return;
    const [r, c] = selected;
    if (givenCells[r][c]) return;
    const next = board.map((row) => [...row]);
    next[r][c] = 0;
    setBoard(next);
  }, [selected, solved, board, givenCells]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') {
        handleDigit(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase();
      } else if (e.key === 'ArrowUp' && r > 0) {
        setSelected([r - 1, c]);
      } else if (e.key === 'ArrowDown' && r < 8) {
        setSelected([r + 1, c]);
      } else if (e.key === 'ArrowLeft' && c > 0) {
        setSelected([r, c - 1]);
      } else if (e.key === 'ArrowRight' && c < 8) {
        setSelected([r, c + 1]);
      }
    },
    [selected, handleDigit, handleErase],
  );

  return (
    <div className="app" onKeyDown={handleKeyDown} tabIndex={0}>
      <header className="app-header">
        <h1>Sudoku Maker</h1>
        <p className="subtitle">Generate and solve sudoku puzzles</p>
      </header>

      <main className="app-main">
        <div className="controls">
          <div className="difficulty-group">
            <span className="label">Difficulty</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <button className="new-game-btn" onClick={newGame}>
            New Game
          </button>
        </div>

        {solved && (
          <div className="solved-banner" role="status">
            🎉 Congratulations! Puzzle solved!
          </div>
        )}

        <SudokuBoard
          board={board}
          solution={solution}
          givenCells={givenCells}
          selected={selected}
          onSelect={setSelected}
        />

        <NumberPad onDigit={handleDigit} onErase={handleErase} />
      </main>
    </div>
  );
}
