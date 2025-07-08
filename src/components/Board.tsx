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
  // グリッドの列数を size に合わせるスタイル
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${size}, 40px)`,
    gap: '4px',
    justifyContent: 'center',
    marginTop: '20px',
  }

  // 外周だけクリック可能にする判定
  const isEdge = (r: number, c: number) =>
    r === 0 || c === 0 || r === size - 1 || c === size - 1

  return (
    <div style={gridStyle}>
      {board.map((rowArr, r) =>
        rowArr.map((cellValue, c) => (
          <Cell
            key={`${r}-${c}`}
            value={cellValue}
            isEdge={isEdge(r, c)}
            onClick={() => {
              if (isEdge(r, c)) onPlace(r, c)
            }}
          />
        ))
      )}
    </div>
  )
}

export default Board
