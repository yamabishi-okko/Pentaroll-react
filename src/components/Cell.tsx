// src/components/Cell.tsx
import React from 'react'
import type { CellValue } from '../types/CellValue'

interface CellProps {
  value: CellValue
  isEdge: boolean
  onClick: () => void
}

const Cell: React.FC<CellProps> = ({ value, isEdge, onClick }) => {
  const cellStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '1px solid #333',
    backgroundColor: isEdge ? '#fafafa' : '#eaeaea',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: isEdge ? 'pointer' : 'default',
  }

  const ballStyle: React.CSSProperties = {
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    backgroundColor: value === 'black' ? '#333' : '#fff',
    boxShadow: value === 'white' ? 'inset 0 0 0 1px #333' : undefined,
  }

  return (
    <div style={cellStyle} onClick={onClick}>
      {value && <div style={ballStyle} />}
    </div>
  )
}

export default Cell
