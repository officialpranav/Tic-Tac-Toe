import './App.css'
import gameGrid from './assets/grid.svg'
import xIcon from './assets/X.svg'
import oIcon from './assets/O.svg'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io.connect("http://localhost:3001")

function App() {
  const [board, setBoard] = useState([["", "", ""], ["", "", ""], ["", "", ""]])
  const [turn, setTurn] = useState('x')
  const [gameOver, setGameOver] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("anonymous")
  const [playerChar, setPlayerChar] = useState("")

  socket.on('log', (data)=>{
    console.log(data)
  })

  socket.on('update-game-state', (data) => {
    setBoard(data.board)
    setPlayerChar(data.playerChar)
    setTurn(data.playerTurn)
  })

  socket.on('board-update', (data) => {
    setBoard(data.newBoard)
    setTurn(data.playerTurn)
  })

  socket.on('reset', (data) => {
    setBoard([["", "", ""], ["", "", ""], ["", "", ""]])
    document.getElementById("gameWinText").hidden = true
    setTurn(data.playerTurn)
    setGameOver(false)
  })

  const getIcon = (character, row, column) => {
    if (character === "") {
      return (<></>)
    } else if (character === "x") {
      return (<img src={xIcon} className='h-full' row={row} column={column} />)
    } else {
      return (<img src={oIcon} className='h-full' row={row} column={column} />)
    }
  }

  const checkWin = () => {
    //check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] !== "" && board[i][1] !== "" && board[i][2] !== "") {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
          return { winner: board[i][0], wintype: "row", row: i }
        }
      }
    }

    //check cols
    for (let i = 0; i < 3; i++) {
      if (board[0][i] !== "" && board[1][i] !== "" && board[2][i] !== "") {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
          return { winner: board[0][i], wintype: "column", column: i }
        }
      }
    }

    //check diagonal 1 (/)
    if (board[0][0] !== "" && board[1][1] !== "" && board[2][2] !== "") {
      if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return { winner: board[1][1], wintype: "diagonal", diagonal: 1 }
      }
    }


    //check diagonal 2 (\)
    if (board[0][2] !== "" && board[1][1] !== "" && board[2][0] !== "") {
      if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return { winner: board[1][1], wintype: "diagonal", diagonal: 2 }
      }
    }

    return false
  }

  const handleRoomChange = () => {
    let newRoomId = document.getElementById("room-input").value
    if(newRoomId !== ""){
      console.log('adf')
      setRoomId(newRoomId)
    }
    //socket.emit('join-room', roomId)
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value !== "" ? e.target.value : "anonymous")
  }

  const handleClick = (e) => {
    if (gameOver || playerChar=="spectator" || playerChar != turn) {
      return
    }
    let row = Number(e.target.getAttribute("row"))
    let column = Number(e.target.getAttribute("column"))

    const nextBoard = board.map((x, i) => {
      return (x.map((y, j) => {
        if (i === row && j === column) {
          return turn
        } else {
          return y
        }
      }))
    })

    socket.emit('board-update', nextBoard)
  }

  useEffect(() => {
    let win = checkWin()
    if (win) {
      setGameOver(true)
      console.log(win)
      document.getElementById("gameWinText").hidden = false
      document.getElementById("gameWinText").innerText = `Game Over! ${win.winner === "x" ? "Player X" : "Player O"} Won!`
    } else {
      let draw = true
      for (const row of board) {
        for (const character of row) {
          if (character === "") {
            draw = false
            break
          }
        }
        if (!draw) break
      }
      if (draw) {
        setGameOver(true)
        document.getElementById("gameWinText").hidden = false
        document.getElementById("gameWinText").innerText = `Game Over: Draw!`
      }
    }
  }, [board])

  return (
    <div className='flex flex-wrap items-center justify-center h-full w-full gap-10 absolute'>
      <div id="control-panel" className='flex flex-col items-center p-5 gap-3 text-white bg-zinc-900 rounded-3xl'>
        <h1 className='font-bold text-3xl'>Tic Tac Toe</h1>
        <div className='hidden'>
          <input id="username-input" autoComplete='off' className='rounded-full px-3 h-7 text-xs w-[21.25rem] bg-zinc-600' placeholder='Username' onChange={handleUsernameChange}/>
        </div>
        <div className='flex gap-3 hidden'>
          <input id="room-input" autoComplete='off' className='rounded-full px-3 text-xs w-72 bg-zinc-600' placeholder='Room ID'/>
          <button className='bg-zinc-700 text-xs w-10 rounded-full h-7' onClick={handleRoomChange}>Join</button>
        </div>
        <button className='rounded-full px-3 h-7 text-xs w-[21.25rem] bg-zinc-700' onClick={() => {socket.emit('reset')}}>
          Reset Board
        </button>
        <div className='text-center bg-zinc-700 p-2 w-[21.25rem] rounded-2xl'>
          <p className='font-bold italic'>
            {playerChar !== "spectator" ? `You are player ${playerChar.toUpperCase()}` : "Spectating"}
          </p>
          <h1 id="turn-message" className='font-bold text-xl'>
            {gameOver? `Game Over` : `Player ${turn.toUpperCase()} to play`}
          </h1>
        </div>
      </div>
      <div id="board" className='relative h-96 w-96 bg-zinc-700 rounded-3xl flex items-center justify-center p-4'>
        <img src={gameGrid} />
        <div className='absolute h-full w-full grid grid-cols-3 grid-rows-3'>
          {
            board.map((row, i) => row.map((column, j) => {
              return (
                <div
                  row={i}
                  column={j}
                  className='flex items-center justify-center boardSquare m-5 rounded-3xl p-2'
                  onClick={handleClick}
                >
                  {getIcon(column, i, j)}
                </div>)
            }))
          }
        </div>
        <h1
          id='gameWinText'
          className='absolute text-white font-bold text-2xl bg-zinc-900 p-2 rounded-xl'
          hidden
        ></h1>
      </div>
    </div>
  )
}



export default App  
