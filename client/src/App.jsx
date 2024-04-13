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
          return { winner: board[i][0], wintype: "column", column: i }
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

  const handleClick = (e) => {
    if (gameOver) {
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

    setBoard(nextBoard)
    setTurn(turn === 'x' ? 'o' : 'x')

    socket.emit('board-update', nextBoard)
  }

  useEffect(() => {
    let win = checkWin()
    setGameOver(win ? true : false)
    if (win) {
      console.log(win)
      document.getElementById("gameWinText").hidden = false
      document.getElementById("gameWinText").innerText = `Game Over! ${turn === "x" ? "Player O" : "Player X"} Won!`
    } else {
      let draw = true
      for(const row of board){
        for(const character of row){
          if(character === ""){
            draw=false
            break
          }
        }
        if(!draw) break
      }
      if(draw){
        document.getElementById("gameWinText").hidden = false
        document.getElementById("gameWinText").innerText = `Game Over: Draw!`
      }
    }
  }, [board])

  return (
    <div className='bg-zinc-800 flex flex-col items-center justify-center h-full w-full absolute'>
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
        >
          
        </h1>
      </div>
    </div>
  )
}



export default App  
