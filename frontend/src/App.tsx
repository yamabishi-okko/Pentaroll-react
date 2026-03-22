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
import WinnerModal from './components/WinnerModal'
import { checkWinnerFive } from './utils/boardUtils'

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

  // ゲームモード関連
  const [modeSelected, setModeSelected] = useState(false)   // 起動直後はモード未選択
  const [mode, setMode] = useState<GameMode>('pvp')         // 'pvp' | 'cpu-easy' | ...
  const [cpuColor, setCpuColor] = useState<PlayerColor>('white') // 例：白をCPUに
  const [winner, setWinner] = useState<PlayerColor | 'draw' | null>(null)
  const [lastMove, setLastMove] = useState<{ r: number; c: number } | null>(null) // 最後に置いたマス（行・列）

  // 初回：モード選択モーダルを表示
  useEffect(() => {
    setModeSelected(false)
  }, [])
  

  const placeBall = (
    row: number,
    col: number,
    dir: { dr: number; dc: number }
  ) => {
    if (winner) return // 決着後は入力無効
  
    // 1) まずローカルに newBoard を組み立てる（board からコピー）
    const newBoard = board.map(r => [...r])
    if (newBoard[row][col] === null) {
      newBoard[row][col] = currentPlayer
    } else {
      shiftLine(newBoard, row, col, dir)
      newBoard[row][col] = currentPlayer
    }
  
    // 2) ここで勝敗を判定（5連＆満杯ドロー対応）
    const decided = checkWinnerFive(newBoard)
  
    // 3) 盤面を一度だけ反映
    setBoard(newBoard)

    // 3.5) 最後に置いた場所を記録（次手で自動的に更新される）
    setLastMove({ r: row, c: col })
  
    // 4) 勝負がついたら手番を進めず終了
    if (decided) {
      setWinner(decided) // 'black' | 'white' | 'draw'
      return
    }
  
    // 5) 続行なら手番交代
    setCurrentPlayer(prev => (prev === 'black' ? 'white' : 'black'))
  }

  // クリック時に呼ばれる関数（いまはまだ動作ロジック未実装）
  // クリック/CPUの一手入口
  // allowCornerModal: 角で既存駒を押す必要がある場合に「縦/横」モーダルを出すか
  //  - 人間: true（既存挙動）
  //  - CPU : false（自動で縦/横を選ぶ）
  const handlePlace = (row: number, col: number, opts?: { allowCornerModal?: boolean }) => {
    const allowCornerModal = opts?.allowCornerModal ?? true
    if (winner) return
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
      // 角で既存ボールを押し出す必要がある
      const canV = !board.every(rArr => rArr[col] !== null)     // 列に空きがある → 縦方向OK
      const canH = !board[row].every(cell => cell !== null)     // 行に空きがある → 横方向OK
      if (!allowCornerModal) {
        // ★ CPUの手番：モーダルを出さず自動決定
        //   ルール：縦が可能なら縦（getPushDirection）/ だめなら横
        let dir: { dr: number; dc: number } | null = null
        if (canV) {
          dir = getPushDirection(row, col, BOARD_SIZE) // 上下(縦)
        } else if (canH) {
          dir = { dr: 0, dc: col === 0 ? 1 : -1 }      // 左右(横)
        }
        if (dir) placeBall(row, col, dir)
        return
      }
      // 人間の手番：モーダル表示で縦/横を選んでもらう
      setCanVertical(canV)
      setCanHorizontal(canH)
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
    if (winner) return
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

  //　モード選択ハンドラ
  const handleSelectMode = (m: GameMode) => {
    setMode(m)
    setModeSelected(true)
    // 新規ゲームにリセット
    setBoard(createEmptyBoard(BOARD_SIZE))
    setCurrentPlayer('black')
    setCpuColor('white')
    setWinner(null)
    setLastMove(null)
  }
  
  
  // CPUの手番ならAPIで1手取得して自動で置く（初級のみ）
  useEffect(() => {
    const isVsCPU = mode !== 'pvp'
    const isCpuTurn = isVsCPU && currentPlayer === cpuColor
    if (!isCpuTurn) return
    if (winner) return

    // 上級はまだ準備中！
    if (mode === 'cpu-hard') return

    const think = async () => {
      try {
        const res = await fetch('/cpu/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ board, currentPlayer, mode }),
        })
        const data = (await res.json()) as { row: number; col: number }
       // CPUは角でもモーダルを出さない
        handlePlace(data.row, data.col, { allowCornerModal: false })
      } catch (e) {
        console.error('CPU呼び出し失敗', e)
      }
    }
    think()
  }, [mode, board, currentPlayer, cpuColor, winner])


  // 盤だけリセット
  const resetBoardOnly = () => {
    setBoard(createEmptyBoard(BOARD_SIZE))
    setCurrentPlayer('black')
    setWinner(null)
    setLastMove(null)
  }

  // モード選択からやり直し
  const resetToModeSelect = () => {
    resetBoardOnly()
    setModeSelected(false)
  }

   // 勝敗がついたら DirectionModal を閉じる（お守り）
  useEffect(() => {
    if (winner) {
      setShowModal(false)
      setPendingPos(null)
    }
  }, [winner]);

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Penta🪼roll</h1>
      {/* モード未選択ならモード選択モーダルを表示 */}
      {!modeSelected && <ModeSelectModal onSelect={handleSelectMode} />}
      <Board
        size={BOARD_SIZE}
        board={board}
        currentPlayer={currentPlayer}
        lastMove={lastMove}
        onPlace={(r, c) => {
          const isVsCPU = mode !== 'pvp'
          const isCpuTurn = isVsCPU && currentPlayer === cpuColor
          if (isCpuTurn) return // CPUの手番は人間クリック無効
          handlePlace(r, c, { allowCornerModal: true })
        }}
      />
      {/* 勝負がついたら DirectionModal は出さない */}
      {showModal && !winner && (
        <DirectionModal
          onChoose={handleModalChoose}
          onCancel={handleModalCancel}
          canVertical={canVertical}
          canHorizontal={canHorizontal}
        />
      )}

      {/* 勝敗モーダルを出す */}
      {winner && (
        <WinnerModal
          winner={winner} // 'black' | 'white' | 'draw'
          onRetrySameMode={resetBoardOnly}
          onBackToModeSelect={resetToModeSelect}
        />
      )}
    </div>
  )
}

export default App
