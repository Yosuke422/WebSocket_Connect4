const express = require('express')
const http = require('http')
const { Server } = require("socket.io")
const cors = require('cors')
const ip = require('ip')

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

const PORT = 3000
const rows = 6
const columns = 7
let board = initializeBoard()
let currentPlayer = 1

function initializeBoard() {
    return Array(rows).fill().map(() => Array(columns).fill(0))
}


function checkForWin() {
    function checkLine(a, b, c, d) {
        return (a !== 0) && (a === b) && (a === c) && (a === d)
    }

    // Check rows for win
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (checkLine(board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3])) {
                return true
            }
        }
    }

    // Check columns for win
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            if (checkLine(board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c])) {
                return true
            }
        }
    }

    // Check \ diagonals
    for (let r = 0; r < rows - 3; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (checkLine(board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3])) {
                return true
            }
        }
    }

    // Check / diagonals
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            if (checkLine(board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3])) {
                return true
            }
        }
    }

    // No win found
    return false
}

function resetGame() {
    board = initializeBoard()
    currentPlayer = 1
    console.log('Current player after reset:', currentPlayer)
    io.emit('gameReset', { board, currentPlayer })
}

let players = []
let waitingPlayer = null


io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id)

    if (waitingPlayer === null) {
        waitingPlayer = socket
        console.log('Waiting for another player to connect.')
        socket.emit('waitingForOpponent')
    } else {
        players = [waitingPlayer, socket]
        console.log('Opponent found: Starting game between ' + waitingPlayer.id + ' and ' + socket.id)
        waitingPlayer.emit('init', { board, currentPlayer, playerNumber: 1, playerId: waitingPlayer.id })
        socket.emit('init', { board, currentPlayer, playerNumber: 2, playerId: socket.id })
        waitingPlayer = null
    }
    
    socket.on('makeMove', (col) => {
        if (board[0][col] === 0) {
            let row = rows - 1
            while (row >= 0 && board[row][col] !== 0) {
                row--
            }
            if (row >= 0) {
                board[row][col] = currentPlayer
                io.emit('moveMade', { board, currentPlayer })

                if (checkForWin()) {
                    io.emit('gameWon', { winner: currentPlayer })
                } else {
                    currentPlayer = 3 - currentPlayer
                }
            }
        }
    })

    socket.on('resetGame', () => {
        resetGame()
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`)
        players = players.filter(p => p !== socket)
        if (waitingPlayer === socket) {
            waitingPlayer = null
        }
        if (players.length === 0) {
            resetGame()
        } else if (players.length === 1) {
            waitingPlayer = players[0]
            waitingPlayer.emit('waitingForOpponent')
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server running at http://${ip.address()}:${PORT}`)
})
