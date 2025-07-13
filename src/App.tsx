// src/App.tsx
import React, { useState } from 'react'
import Board from './components/Board'
import type { BoardState } from './types/BoardState'
import { createEmptyBoard } from './types/BoardState'
import type { PlayerColor } from './types/PlayerColor'
import { getPushDirection, shiftLine } from './utils/boardUtils'
import DirectionModal from './components/DirectionModal'

const BOARD_SIZE = 6 

const App: React.FC = () => {
  // 盤面の state。createEmptyBoard(BOARD_SIZE) で null 埋めの空盤面を作成
  const [board, setBoard] = useState<BoardState>(createEmptyBoard(BOARD_SIZE))
  // 手番プレイヤーの色。'black' or 'white'
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('black')
  // モーダル表示フラグ
  const [showModal, setShowModal] = useState(false)
  // モーダルから返ってきた押し込む角の座標を一時保持
  const [pendingPos, setPendingPos] = useState<{ r: number; c: number } | null>(null)

  const placeBall = (
    row: number,
    col: number,
    dir: { dr: number; dc: number }
  ) => {
    setBoard(prev => {
      const newBoard = prev.map(r => [...r])
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer
      } else {
        shiftLine(newBoard, row, col, dir)
        newBoard[row][col] = currentPlayer
      }
      return newBoard
    })
    setCurrentPlayer(prev => (prev === 'black' ? 'white' : 'black'))
  }

  // クリック時に呼ばれる関数（いまはまだ動作ロジック未実装）
  const handlePlace = (row: number, col: number) => {
    // 四隅かどうか判定
    const isCorner =
      (row === 0 || row === BOARD_SIZE - 1) &&
      (col === 0 || col === BOARD_SIZE - 1)

    if (isCorner) {
      // 角ならモーダルを起動して「縦 or 横」を選んでもらう
      setPendingPos({ r: row, c: col })
      setShowModal(true)
      return
    }
    // 角以外は自動で押し出し方向を決めて配置
    const dir = getPushDirection(row, col, BOARD_SIZE)
    placeBall(row, col, dir)
  }
  
   // モーダルで「縦側」「横側」を選んだら呼ばれる
  const handleModalChoose = (isVertical: boolean) => {
    if (pendingPos) {
      const { r, c } = pendingPos
      // 縦なら getPushDirection、横なら左右方向を指定
      const dir = isVertical
        ? getPushDirection(r, c, BOARD_SIZE)
        : { dr: 0, dc: c === 0 ? 1 : -1 }
      placeBall(r, c, dir)
    }
    setShowModal(false)
    setPendingPos(null)
  }

  // モーダルのキャンセルハンドラ
  const handleModalCancel = () => {
    setShowModal(false)
    setPendingPos(null)
  }

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Penta🪼roll</h1>
      <Board
        size={BOARD_SIZE}
        board={board}
        currentPlayer={currentPlayer}
        onPlace={handlePlace}
      />
      {showModal && (
        <DirectionModal
          onChoose={handleModalChoose}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  )
}

export default App
