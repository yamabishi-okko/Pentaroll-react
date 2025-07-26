// // src/App.tsx
// import React, { useState } from 'react'
// import Board from './components/Board'
// import type { BoardState } from './types/BoardState'
// import { createEmptyBoard } from './types/BoardState'
// import type { PlayerColor } from './types/PlayerColor'
// import { getPushDirection, shiftLine } from './utils/boardUtils'
// import DirectionModal from './components/DirectionModal'

// const BOARD_SIZE = 6 

// const App: React.FC = () => {
//   // 盤面の state。createEmptyBoard(BOARD_SIZE) で null 埋めの空盤面を作成
//   const [board, setBoard] = useState<BoardState>(createEmptyBoard(BOARD_SIZE))
//   // 手番プレイヤーの色。'black' or 'white'
//   const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('black')
//   // モーダル表示フラグ
//   const [showModal, setShowModal] = useState(false)
//   // モーダルから返ってきた押し込む角の座標を一時保持
//   const [pendingPos, setPendingPos] = useState<{ r: number; c: number } | null>(null)
//   // どちらに押し込めるかを保持
//   const [canVertical, setCanVertical] = useState(true)
//   const [canHorizontal, setCanHorizontal] = useState(true)

//   const placeBall = (
//     row: number,
//     col: number,
//     dir: { dr: number; dc: number }
//   ) => {
//     setBoard(prev => {
//       const newBoard = prev.map(r => [...r])
//       if (newBoard[row][col] === null) {
//         newBoard[row][col] = currentPlayer
//       } else {
//         shiftLine(newBoard, row, col, dir)
//         newBoard[row][col] = currentPlayer
//       }
//       return newBoard
//     })
//     setCurrentPlayer(prev => (prev === 'black' ? 'white' : 'black'))
//   }

//   // クリック時に呼ばれる関数（いまはまだ動作ロジック未実装）
//   const handlePlace = (row: number, col: number) => {
//     // 四隅かどうか判定
//     const isCorner =
//       (row === 0 || row === BOARD_SIZE - 1) &&
//       (col === 0 || col === BOARD_SIZE - 1)

//     if (isCorner) {
//       // 角セルが空なら押し出し不要 → そのまま配置して終了
//       if (board[row][col] === null) {
//         const dir = getPushDirection(row, col, BOARD_SIZE)
//         placeBall(row, col, dir)
//         return
//       }
//       // 既存ボールを押し出す場合のみモーダル表示
//       setCanVertical(!board.every(rArr => rArr[col] !== null))
//       setCanHorizontal(!board[row].every(cell => cell !== null))
//       setPendingPos({ r: row, c: col })
//       setShowModal(true)
//       return
//     }
//     // 角以外は自動で押し出し方向を決めて配置
//     const dir = getPushDirection(row, col, BOARD_SIZE)
//     placeBall(row, col, dir)
//   }
  
//    // モーダルで「縦側」「横側」を選んだら呼ばれる
//   const handleModalChoose = (isVertical: boolean) => {
//     if (pendingPos) {
//       const { r, c } = pendingPos
//       // 縦なら getPushDirection、横なら左右方向を指定
//       const dir = isVertical
//         ? getPushDirection(r, c, BOARD_SIZE)
//         : { dr: 0, dc: c === 0 ? 1 : -1 }
//       placeBall(r, c, dir)
//     }
//     setShowModal(false)
//     setPendingPos(null)
//   }

//   // モーダルのキャンセルハンドラ
//   const handleModalCancel = () => {
//     setShowModal(false)
//     setPendingPos(null)
//   }

//   return (
//     <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
//       <h1>Penta🪼roll</h1>
//       <Board
//         size={BOARD_SIZE}
//         board={board}
//         currentPlayer={currentPlayer}
//         onPlace={handlePlace}
//       />
//       {showModal && (
//         <DirectionModal
//           onChoose={handleModalChoose}
//           onCancel={handleModalCancel}
//           canVertical={canVertical}
//           canHorizontal={canHorizontal}
//         />
//       )}
//     </div>
//   )
// }

// export default App


import React, { useState, useEffect, useRef } from 'react'
import Board from './components/Board'
import type { BoardState } from './types/BoardState'
import { createEmptyBoard } from './types/BoardState'
import type { PlayerColor } from './types/PlayerColor'
import { getPushDirection } from './utils/boardUtils'
import DirectionModal from './components/DirectionModal'

const BOARD_SIZE = 6
const WS_URL = import.meta.env.VITE_WS_URL as string

const App: React.FC = () => {
  // ボードと手番の state
  const [board, setBoard] = useState<BoardState>(createEmptyBoard(BOARD_SIZE))
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('black')
  // モーダル関連の state
  const [showModal, setShowModal] = useState(false)
  const [pendingPos, setPendingPos] = useState<{ r: number; c: number } | null>(null)
  const [canVertical, setCanVertical] = useState(true)
  const [canHorizontal, setCanHorizontal] = useState(true)

  // WebSocket インスタンスを保持
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL)

    // 接続成功
    wsRef.current.onopen = () => console.log('WS Connected')

    // メッセージ受信
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      // assign メッセージ（先手/後手の割り当て）
      if (msg.action === 'assign') {
        setCurrentPlayer(msg.player)
        console.log('[WS recv]', msg)

        return
      }

      // reset ブロードキャスト
      if (msg.action === 'reset' && msg.reset) {
        const newBoard = msg.board.map((row: string[]) =>
          row.map(cell => (cell === 'empty' ? null : (cell as PlayerColor)))
        )
        console.log('[newBoard]', newBoard)
        setBoard(newBoard)
        return
      }
      console.log(msg);

      // move ブロードキャスト
      if (msg.action === 'move' && msg.board && msg.player) {
        const newBoard = msg.board.map((row: string[]) =>
          row.map(cell => (cell === 'empty' ? null : (cell as PlayerColor)))
        )
        console.log('[newBoard move]', newBoard)
        setBoard(newBoard)
        // 次手番へ切り替え
        const next = msg.player === 'black' ? 'white' : 'black'
        setCurrentPlayer(next)
      }
    }

    // 切断時
    wsRef.current.onclose = () => console.log('WS Disconnected')

    // クリーンアップ
    return () => {
      wsRef.current?.close()
    }
  }, [])

  // サーバーへ送信する共通関数
  const sendAction = (payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }

  // 盤面クリック時
  const handlePlace = (row: number, col: number) => {
    const isCorner =
      (row === 0 || row === BOARD_SIZE - 1) &&
      (col === 0 || col === BOARD_SIZE - 1)

    // 角セルかつ既に石がある場合はモーダル
    if (isCorner && (board[row][col] !== null || board[row][col] !== "empty")) {
      setCanVertical(!board.every(rArr => rArr[col] !== null))
      setCanHorizontal(!board[row].every(cell => cell !== null))
      setPendingPos({ r: row, c: col })
      setShowModal(true)
      return
    }

    // それ以外は自動で方向を決めて move
    const dir = getPushDirection(row, col, BOARD_SIZE)
    sendAction({
      action: 'move',
      row,
      col,
      direction: dir.dr !== 0 ? 'vertical' : 'horizontal'
    })
  }

  // モーダルで縦／横を選択したとき
  const handleModalChoose = (isVertical: boolean) => {
    if (pendingPos) {
      const { r, c } = pendingPos
      sendAction({
        action: 'move',
        row: r,
        col: c,
        direction: isVertical ? 'vertical' : 'horizontal'
      })
    }
    setShowModal(false)
    setPendingPos(null)
  }

  // モーダルをキャンセル
  const handleModalCancel = () => {
    setShowModal(false)
    setPendingPos(null)
  }

  // リセットボタン
  const handleReset = () => {
    sendAction({ action: 'reset' })
  }

  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Penta🪼roll</h1>
      <button onClick={handleReset}>Reset</button>
      <Board
        size={BOARD_SIZE}
        board={board}
        onPlace={handlePlace}
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

