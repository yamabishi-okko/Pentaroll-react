// src/components/Board.tsx
import React from 'react'
import Cell from './Cell'
import type { BoardState } from '../types/BoardState'
import type { PlayerColor } from '../types/PlayerColor'

interface BoardProps {
  size: number
  board: BoardState
  currentPlayer: PlayerColor
  onPlace: (row: number, col: number) => void
}

const Board: React.FC<BoardProps> = ({ size, board, onPlace }) => {
  // その行が満杯か？
  const isRowFull = (r: number) => board[r].every(cell => cell !== null)
  // その列が満杯か？
  const isColFull = (c: number) => board.every(rowArr => rowArr[c] !== null)
  // 外周セルかどうか
  const isEdge = (r: number, c: number) =>
    r === 0 || c === 0 || r === size - 1 || c === size - 1

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 40px)`,
    gap: '4px',
    justifyContent: 'center',
    marginTop: '20px',
  }

  return (
    <div style={gridStyle}>
      {board.map((rowArr, r) =>
        rowArr.map((cellValue, c) => {
          const edge = isEdge(r, c)
          const fullLine = isRowFull(r) || isColFull(c)
          // 外周かつ行・列が満杯でないセルのみクリック可能
          const clickable = edge && !fullLine

          return (
            <Cell
              key={`${r}-${c}`}
              value={cellValue}
              isEdge={edge}
              onClick={() => {
                if (clickable) onPlace(r, c)
              }}
              disabled={!clickable}
            />
          )
        })
      )}
    </div>
  )
}

export default Board
