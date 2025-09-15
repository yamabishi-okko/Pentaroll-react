import React from 'react'

export type GameMode = 'pvp' | 'cpu-easy' | 'cpu-medium' | 'cpu-hard'
// GameMode は 文字列の種類を限定した型（TypeScript）。
// つまり onSelect に渡せるのはこの4つのどれかだけ。

interface ModeSelectModalProps {
  onSelect: (mode: GameMode) => void
}
//このコンポーネントが**外から受け取る値（props）**は onSelect だけ。
//onSelect は「どのモードが選ばれたか」を親に渡す関数。

const ModeSelectModal: React.FC<ModeSelectModalProps> = ({ onSelect }) => {
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
    borderRadius: 8,
    padding: '24px',
    minWidth: 320,
    textAlign: 'center',
  }

  const row: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  }

  const btn: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    border: '1px solid #333',
    background: '#f7f7f7',
    minWidth: 140,
    color: '#000',
  }

  const btnDisabled: React.CSSProperties = {
    ...btn,
    background: '#e5e5e5',
    color: '#888',
    borderColor: '#bbb',
    cursor: 'not-allowed',
  }

  return (
    <div style={backdrop} role="dialog" aria-modal="true" aria-label="ゲームモード選択">
      <div style={box}>
        <h3 style={{ marginTop: 0 }}>ゲームモードを選択</h3>
        <p>対戦方式を選んでください</p>

        <div style={row}>
          <button style={btn} onClick={() => onSelect('pvp')}>
            友人対戦（PvP）
          </button>

          <button style={btn} onClick={() => onSelect('cpu-easy')}>
            AI対戦（初級）
          </button>

          {/* 中級・上級は準備中：グレー＆押せない */}
          <button
            style={btnDisabled}
            disabled
            aria-disabled="true"
            title="準備中"
          >
            AI対戦（中級）
          </button>

          <button
            style={btnDisabled}
            disabled
            aria-disabled="true"
            title="準備中"
          >
            AI対戦（上級）
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModeSelectModal
