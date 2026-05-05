import React from 'react';
import './Cell.css';

const Cell = ({ value, onClick, isWinningCell }) => {
  let className = 'cell';
  if (value) className += ` cell-${value.toLowerCase()}`;
  if (isWinningCell) className += ' winning-cell';

  return (
    <div className={className} onClick={onClick}>
      {value === 'X' && <span className="mark-x">X</span>}
      {value === 'O' && <span className="mark-o">O</span>}
    </div>
  );
};

export default Cell;
