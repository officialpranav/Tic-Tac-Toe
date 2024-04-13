const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
app.use(cors())

const server = http.createServer(app)
let board = [["", "", "s"], ["", "", ""], ["", "", ""]]

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log("User Connected: " + socket.id)

  socket.on('board-update', (data)=>{
    console.log("packet recieved")
  })

  socket.on('join_room', (data) => {
    socket.join(data)
  })
})

server.listen(3001, ()=>{
  console.log('Server is online')
})