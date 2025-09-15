// src/components/Cell.tsx
import React from 'react'
import type { CellValue } from '../types/CellValue'

interface CellProps {
  value: CellValue
  isEdge: boolean
  onClick: () => void
  disabled?: boolean
}

const Cell: React.FC<CellProps> = ({
  value,
  isEdge,
  onClick,
  disabled = false,     // ← ここで受け取る＆デフォルト false
}) => {
  const cellStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '1px solid #333',
    backgroundColor:  disabled
      ? '#ddd'
      : isEdge
      ? '#fafafa'
      : '#eaeaea',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: disabled
      ? 'not-allowed'
      : isEdge
      ? 'pointer'
      : 'default',
  }

  const ballStyle: React.CSSProperties = {
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    backgroundColor: value === 'black' ? '#333' : '#fff',
    boxShadow: value === 'white' ? 'inset 0 0 0 1px #333' : undefined,
  }

  return (
    <div
      style={cellStyle}
      onClick={disabled ? undefined : onClick}  // 無効時はクリックを受け付けない
    >
      {value && <div style={ballStyle} />}
    </div>
  )
}

export default Cell
