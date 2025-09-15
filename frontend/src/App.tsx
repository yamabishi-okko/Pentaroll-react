// src/App.tsx
import React, { useEffect, useState } from 'react'
import Board from './components/Board'
import type { BoardState } from './types/BoardState'
import { createEmptyBoard } from './types/BoardState'
import type { PlayerColor } from './types/PlayerColor'
import { getPushDirection, shiftLine } from './utils/boardUtils'
import DirectionModal from './components/DirectionModal'
import ModeSelectModal from './components/ModeSelectModal'
import type { GameMode } from './components/ModeSelectModal'

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
  // どちらに押し込めるかを保持
  const [canVertical, setCanVertical] = useState(true)
  const [canHorizontal, setCanHorizontal] = useState(true)

  // 追加：ゲームモード関連
  const [modeSelected, setModeSelected] = useState(false)   // 起動直後はモード未選択
  const [mode, setMode] = useState<GameMode>('pvp')         // 'pvp' | 'cpu-easy' | ...
  const [cpuColor, setCpuColor] = useState<PlayerColor>('white') // 例：白をCPUに

  // 初回：モード選択モーダルを表示
  useEffect(() => {
    setModeSelected(false)
  }, [])

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
      // 角セルが空なら押し出し不要 → そのまま配置して終了
      if (board[row][col] === null) {
        const dir = getPushDirection(row, col, BOARD_SIZE)
        placeBall(row, col, dir)
        return
      }
      // 既存ボールを押し出す場合のみモーダル表示
      setCanVertical(!board.every(rArr => rArr[col] !== null))
      setCanHorizontal(!board[row].every(cell => cell !== null))
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

  // 追加：モード選択ハンドラ
  const handleSelectMode = (m: GameMode) => {
      setMode(m)
      setModeSelected(true)
      // 新規ゲームにリセット
      setBoard(createEmptyBoard(BOARD_SIZE))
      setCurrentPlayer('black')
      setCpuColor('white') // 必要なら m に応じて変えてもOK
    }
  
    // 追加：CPUの手番ならAPIで1手取得して自動で置く（初級のみ）
    useEffect(() => {
      const isVsCPU = mode !== 'pvp'
      const isCpuTurn = isVsCPU && currentPlayer === cpuColor
      if (!isCpuTurn) return
  
      // 中級/上級はまだ準備中！
      if (mode === 'cpu-medium' || mode === 'cpu-hard') return
  
      const think = async () => {
        try {
          const res = await fetch('/cpu/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board, currentPlayer }),
          })
          const data = (await res.json()) as { row: number; col: number }
          // 人間と同じ入口処理で配置
          handlePlace(data.row, data.col)
        } catch (e) {
          console.error('CPU呼び出し失敗', e)
        }
      }
      think()
    }, [mode, board, currentPlayer, cpuColor])

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Penta🪼roll</h1>
      {/* モード未選択ならモード選択モーダルを表示 */}
      {!modeSelected && <ModeSelectModal onSelect={handleSelectMode} />}
      <Board
        size={BOARD_SIZE}
        board={board}
        currentPlayer={currentPlayer}
        onPlace={(r, c) => {
          const isVsCPU = mode !== 'pvp'
          const isCpuTurn = isVsCPU && currentPlayer === cpuColor
          if (isCpuTurn) return // CPUの手番は人間クリック無効
          handlePlace(r, c)
        }}
      />
      {showModal && (
        <DirectionModal
          onChoose={handleModalChoose}
          onCancel={handleModalCancel}
          canVertical={canVertical}
          canHorizontal={canHorizontal}
        />
      )}
    </div>
  )
}

export default App
