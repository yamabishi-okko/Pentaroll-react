// src/App.tsx
import React, { useState } from 'react'
import Board from './components/Board'
import type { BoardState } from './types/BoardState'
import { createEmptyBoard } from './types/BoardState' 
import type { PlayerColor } from './types/PlayerColor'

const BOARD_SIZE = 6 

const App: React.FC = () => {
  // 盤面の state。createEmptyBoard(BOARD_SIZE) で null 埋めの空盤面を作成
  const [board, setBoard] = useState<BoardState>(createEmptyBoard(BOARD_SIZE))
  // 手番プレイヤーの色。'black' or 'white'
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('black')

  // クリック時に呼ばれる関数（いまはまだ動作ロジック未実装）
  const handlePlace = (row: number, col: number) => {
    console.log(`Click at ${row}, ${col} by`, currentPlayer)
    // ここに「押し出し」処理を書いていく予定だよ
  }

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Pentaroll</h1>
      <Board
        size={BOARD_SIZE}
        board={board}
        currentPlayer={currentPlayer}
        onPlace={handlePlace}
      />
    </div>
  )
}

export default App
