const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { truncate } = require('fs')
app.use(cors())

const server = http.createServer(app)

let gameState = {
  board: [["","",""],["","",""],["","",""]],
  playerTurn: "x",
}

let playerList = {
  x: false,
  o: false,
  spectator: false,
}

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

let playerTurn = "x"

io.on('connection', (socket) => {
  if(!playerList.x) {
    socket.playerChar = "x"
    playerList.x = true
  } else if(!playerList.o) {
    socket.playerChar = "o"
    playerList.o = true
  } else {
    socket.playerChar = "spectator"
  }

  socket.emit('log', socket.playerChar)

  socket.emit('update-game-state', {
    playerChar: socket.playerChar,
    board: gameState.board,
    playerTurn: gameState.playerTurn
  })

  socket.on('board-update', (newBoard)=>{
    gameState.playerTurn = (gameState.playerTurn == "x" ? "o" : "x")
    gameState.board = newBoard
    io.emit('board-update', {
      newBoard: gameState.board,
      playerTurn: gameState.playerTurn
    })
  })

  socket.on('reset', () => {
    gameState.playerTurn = (gameState.playerTurn == "x" ? "o" : "x")
    gameState.board = [["","",""],["","",""],["","",""]]
    io.emit('reset', {
      playerTurn: gameState.playerTurn
    })
  })

  socket.on('join-room', (data) => {
    socket.join(data)
  })
  
  socket.on('disconnect', (data) => {
    socket.broadcast.emit('log','Someone Left!')
    playerList[socket.playerChar] = false
  })
})

server.listen(3001, ()=>{
  console.log('Server is online')
})