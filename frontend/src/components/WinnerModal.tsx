import React from 'react'
import type { PlayerColor } from '../types/PlayerColor'

type Winner = PlayerColor | 'draw'

interface Props {
  winner: Winner
  onRetrySameMode: () => void
  onBackToModeSelect: () => void
}

const WinnerModal: React.FC<Props> = ({ winner, onRetrySameMode, onBackToModeSelect }) => {
  const backdrop: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const box: React.CSSProperties = {
    background: '#fff',
    color: '#000',
    borderRadius: 12,
    padding: 24,
    minWidth: 320,
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  }

  const title = winner === 'draw' ? '引き分け！' : winner === 'black' ? '黒の勝ち！' : '白の勝ち！'

  const btnRow: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  }

  const btn: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #ccc',
    background: '#f7f7f7',
    cursor: 'pointer',
    minWidth: 140,
    color: '#000',
  }

  return (
    <div style={backdrop} role="dialog" aria-modal="true" aria-label="勝敗結果">
      <div style={box}>
        <h2 style={{ margin: '0 0 8px' }}>{title}</h2>
        <p style={{ margin: 0 }}>もう一度遊ぶか、最初のモード選択に戻るか選んでください。</p>
        <div style={btnRow}>
          <button style={btn} onClick={onRetrySameMode}>もう一度（同じモード）</button>
          <button style={btn} onClick={onBackToModeSelect}>最初に戻る（モード選択）</button>
        </div>
      </div>
    </div>
  )
}

export default WinnerModal
