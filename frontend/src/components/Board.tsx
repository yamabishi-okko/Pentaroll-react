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
   // 四隅かどうか
  const isCorner = (r: number, c: number) =>
    (r === 0 || r === size - 1) && (c === 0 || c === size - 1)


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

          // デフォルトはクリック不可
          let clickable = false

          if (edge) {
            const topOrBottom = r === 0 || r === size - 1
            const leftOrRight = c === 0 || c === size - 1

            if (isCorner(r, c)) {
              // 四隅：行 or 列のどちらかに空きがあればOK
              clickable = !isRowFull(r) || !isColFull(c)
            } else if (topOrBottom) {
              // 上端/下端：縦方向に押し出す → 列に空きがあればOK
              clickable = !isColFull(c)
            } else if (leftOrRight) {
              // 左端/右端：横方向に押し出す → 行に空きがあればOK
              clickable = !isRowFull(r)
            }
          }
          
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
