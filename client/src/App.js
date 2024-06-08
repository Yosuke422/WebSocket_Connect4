import React, { useEffect, useState, useCallback } from 'react'
import io from 'socket.io-client'
import Board from './components/Board'
import Modal from './components/Modal'
import Confetti from 'react-confetti'
import './App.css'

const socket = io('http://localhost:3000')

function App() {
    const [board, setBoard] = useState(Array(6).fill().map(() => Array(7).fill(0)))
    const [currentPlayer, setCurrentPlayer] = useState(1)
    const [gameOver, setGameOver] = useState(false)
    const [winner, setWinner] = useState(null)
    const [showConfetti, setShowConfetti] = useState(false)
    const [playerNumber, setPlayerNumber] = useState(null)
    const [playerId, setPlayerId] = useState(null)

    useEffect(() => {
        socket.emit('joinGame') // Emit joinGame when the client connects

        socket.on('init', ({ board, currentPlayer, playerNumber, playerId }) => {
            setBoard(board)
            setCurrentPlayer(currentPlayer)
            setPlayerNumber(playerNumber)
            setPlayerId(playerId)
        })

        socket.on('moveMade', ({ board, currentPlayer }) => {
            setBoard(board)
            setCurrentPlayer(currentPlayer)
        })

        socket.on('gameReset', ({ board, currentPlayer }) => {
            setBoard(board)
            setCurrentPlayer(currentPlayer)
            setGameOver(false)
            setWinner(null)
            setShowConfetti(false)
        })

        socket.on('gameWon', ({ winner }) => {
            setGameOver(true)
            setWinner(winner)
            setShowConfetti(true)
        })

        return () => {
            socket.off('init')
            socket.off('moveMade')
            socket.off('gameReset')
            socket.off('gameWon')
        }
    }, [])

    const makeMove = useCallback((col) => {
        if (!gameOver) {
            socket.emit('makeMove', col)
        }
    }, [gameOver])

    const resetGame = useCallback(() => {
        socket.emit('resetGame')
    }, [])

    return (
        <div className="app">
            <h1>Connect Four</h1>
            <div className="status">
                <div className="current-player">
                    Current Player: Player {currentPlayer}
                </div>
                <div className="player-info">
                    You are Player {playerNumber} (ID: {playerId})
                </div>
            </div>
            <Board board={board} makeMove={makeMove} />
            <button className="reset-button" onClick={resetGame}>Reset Game</button>
            {gameOver && (
                <>
                    <Modal winner={winner} onRestart={resetGame} />
                    {showConfetti && <Confetti />}
                </>
            )}
        </div>
    )
}

export default App
