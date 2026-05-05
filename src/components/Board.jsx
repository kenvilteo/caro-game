import React from 'react';
import Cell from './Cell';
import './Board.css';

const Board = ({ board, onClick, winningCells }) => {
  const isWinningCell = (r, c) => {
    if (!winningCells) return false;
    return winningCells.some(cell => cell.r === r && cell.c === c);
  };

  return (
    <div className="board">
      {board.map((row, rIndex) => (
        <div key={rIndex} className="board-row">
          {row.map((cell, cIndex) => (
            <Cell
              key={`${rIndex}-${cIndex}`}
              value={cell}
              onClick={() => onClick(rIndex, cIndex)}
              isWinningCell={isWinningCell(rIndex, cIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
