// src/components/DirectionModal.tsx
import React from 'react'

interface DirectionModalProps {
  onChoose: (isVertical: boolean) => void
  onCancel: () => void 
}

const DirectionModal: React.FC<DirectionModalProps> = ({
    onChoose,
    onCancel
}) => {
  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
  const boxStyle: React.CSSProperties = {
    position: 'relative', 
    backgroundColor: '#fff',
    padding: '20px 20px 40px',
    borderRadius: '8px',
    textAlign: 'center',
    minWidth: '240px',
    color: '#000',
  }
  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    textAlign: 'center',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#000',
    cursor: 'pointer',
  }
  const btnStyle: React.CSSProperties = {
    margin: '0 8px',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  }

  return (
    <div style={backdropStyle}>
      <div style={boxStyle}>
        {/* ×ボタン */}
        <button
          style={closeStyle}
          onClick={onCancel}
          aria-label="閉じる"
        >
         ×
        </button>
        <p style={{ margin: '24px 0' }}>
        🌙どちらにボールを押し込みますか⭐️？
        </p>
        <button
          style={btnStyle}
          onClick={() => onChoose(true)}
        >
          縦側
        </button>
        <button
          style={btnStyle}
          onClick={() => onChoose(false)}
        >
          横側
        </button>
      </div>
    </div>
  )
}

export default DirectionModal
