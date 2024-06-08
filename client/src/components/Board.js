import React from 'react'
import '../components/board.css'

function Board({ board, makeMove }) {
  return (
    <div className="board-container"> 
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className="cell" onClick={() => makeMove(colIndex)}>
                {cell !== 0 && (
                  <div className={`disc ${cell === 1 ? 'player-one' : 'player-two'}`}></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Board
