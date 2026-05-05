import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { createEmptyBoard, checkWin, getBestMove } from './utils/gameLogic';
import './App.css';

const App = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState(null);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  
  // X is human, O is AI (or player 2)
  const currentPlayer = xIsNext ? 'X' : 'O';

  useEffect(() => {
    // Determine if it's AI turn
    // If AI is enabled, human is X, AI is O
    if (isAIEnabled && !xIsNext && !winner) {
      const timer = setTimeout(() => {
        const move = getBestMove(board, 'O');
        if (move) {
          executeMove(move.r, move.c, 'O');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, isAIEnabled, winner, board]);

  const executeMove = (row, col, playerStr) => {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = playerStr;
    setBoard(newBoard);

    const winData = checkWin(newBoard, row, col, playerStr);
    if (winData) {
      setWinner(winData.winner);
      const cells = [];
      const [dr, dc] = winData.direction;
      let [currR, currC] = winData.start;
      const [endR, endC] = winData.end;
      
      let stepCount = 0;
      while (stepCount < 10) {
        cells.push({ r: currR, c: currC });
        if (currR === endR && currC === endC) break;
        currR += dr;
        currC += dc;
        stepCount++;
      }
      setWinningCells(cells);
    } else {
      setXIsNext(playerStr === 'X' ? false : true);
    }
  };

  const handlePlay = (row, col) => {
    if (board[row][col] || winner) return;
    
    // Block input if it's AI's turn
    if (isAIEnabled && !xIsNext) return;

    executeMove(row, col, currentPlayer);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setXIsNext(true);
    setWinner(null);
    setWinningCells(null);
  };

  return (
    <div className="app-container">
      <div className="glass-panel main-panel">
        <h1 className="title">CARO <span className="highlight">PRO</span></h1>
        
        <div className="status-bar">
          <div className="mode-toggle">
            <label className="toggle-container">
              <input 
                type="checkbox" 
                checked={isAIEnabled} 
                onChange={(e) => {
                  setIsAIEnabled(e.target.checked);
                  resetGame();
                }}
              />
              <span className="slider round"></span>
            </label>
            <span className="toggle-label">Play vs AI</span>
          </div>
          
          <div className="status-text">
            {winner ? (
              <span className={`winner-text glow-${winner.toLowerCase()}`}>
                Player {winner} Wins!
              </span>
            ) : (
              <span>Turn: <strong className={`text-${currentPlayer.toLowerCase()}`}>{currentPlayer}</strong></span>
            )}
          </div>
          
          <button className="reset-btn" onClick={resetGame}>Reset</button>
        </div>

        <div className="board-wrapper">
          <Board board={board} onClick={handlePlay} winningCells={winningCells} />
        </div>
      </div>
    </div>
  );
};

export default App;
