// src/components/Cell.tsx
import React from 'react'
import type { CellValue } from '../types/CellValue'

interface CellProps {
  value: CellValue
  isEdge: boolean
  onClick: () => void
  disabled?: boolean
  isLast?: boolean // 最後の手かどうか
}

const Cell: React.FC<CellProps> = ({
  value,
  isEdge,
  onClick,
  disabled = false,
  isLast = false,
}) => {
  const bg = disabled ? '#ddd' : (isEdge ? '#fafafa' : '#eaeaea')
  const cellStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    // border: '1px solid #333',
    // backgroundColor:  disabled
    //   ? '#ddd'
    //   : isEdge
    //   ? '#fafafa'
    //   : '#eaeaea',
    border: isLast ? '2px solid transparent' : '1px solid #333',
    backgroundColor: bg,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: disabled
      ? 'not-allowed'
      : isEdge
      ? 'pointer'
      : 'default',
    // outline: isLast ? '2px solid #00cfff' : 'none', // 青い枠
    // outlineOffset: '-2px', // 枠が内側に入りすぎないよう調整
    // boxShadow: isLast
    //   ? '0 0 6px 2px rgba(0, 200, 255, 0.8)' // 光るエフェクト
    //   : 'none',
    // boxSizing: 'border-box',
    outline: 'none',
    boxSizing: 'border-box',
    // ★ CSS側で使うカスタムプロパティ（背景色を渡す）
    //   型の都合で as any を付けずに書けるよう key を文字列指定
    ['--cell-bg' as any]: bg,
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
      className={isLast ? 'cell-last-glow' : undefined}
      onClick={disabled ? undefined : onClick}  // 無効時はクリックを受け付けない
    >
      {value && <div style={ballStyle} />}
    </div>
  )
}

export default Cell
