// src/utils/boardUtils.ts
import type { BoardState } from '../types/BoardState'
import type { PlayerColor } from '../types/PlayerColor'

// 1列内で color が5連続あるか
function hasFiveInLine(cells: (PlayerColor | null)[], color: PlayerColor): boolean {
  let run = 0
  for (const v of cells) {
    if (v === color) {
      run++
      if (run >= 5) return true
    } else {
      run = 0
    }
  }
  return false
}

// 盤面がすべて埋まっているか
function isBoardFull(board: BoardState): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell === null) return false
    }
  }
  return true
}

// 盤の全“列”（行・列・斜め）を列挙（長さ5以上のみ）
function enumerateAllLines(board: BoardState): ( (PlayerColor|null)[] )[] {
  const n = board.length
  const lines: ( (PlayerColor|null)[] )[] = []

  // 行
  for (let r = 0; r < n; r++) lines.push(board[r])

  // 列
  for (let c = 0; c < n; c++) {
    const col: (PlayerColor|null)[] = []
    for (let r = 0; r < n; r++) col.push(board[r][c])
    lines.push(col)
  }

  // 斜め（左上→右下）
  for (let r0 = 0; r0 < n; r0++) {
    const diag: (PlayerColor|null)[] = []
    for (let i = 0; r0 + i < n && i < n; i++) diag.push(board[r0 + i][i])
    if (diag.length >= 5) lines.push(diag)
  }
  for (let c0 = 1; c0 < n; c0++) {
    const diag: (PlayerColor|null)[] = []
    for (let i = 0; i < n && c0 + i < n; i++) diag.push(board[i][c0 + i])
    if (diag.length >= 5) lines.push(diag)
  }

  // 斜め（右上→左下）
  for (let r0 = 0; r0 < n; r0++) {
    const diag: (PlayerColor|null)[] = []
    for (let i = 0; r0 + i < n && n - 1 - i >= 0; i++) diag.push(board[r0 + i][n - 1 - i])
    if (diag.length >= 5) lines.push(diag)
  }
  for (let c0 = n - 2; c0 >= 0; c0--) {
    const diag: (PlayerColor|null)[] = []
    for (let i = 0; i < n && c0 - i >= 0; i++) diag.push(board[i][c0 - i])
    if (diag.length >= 5) lines.push(diag)
  }

  return lines
}

/**
 * 5並びの勝者判定。
 * - 黒のみ成立 → 'black'
 * - 白のみ成立 → 'white'
 * - 黒白同時成立 → 'draw'
 * - どちらも未成立だが盤が満杯 → 'draw'
 * - どちらも未成立かつまだ空きあり → null
 */
export function checkWinnerFive(board: BoardState): PlayerColor | 'draw' | null {
  const lines = enumerateAllLines(board)
  const blackWin = lines.some(line => hasFiveInLine(line, 'black'))
  const whiteWin = lines.some(line => hasFiveInLine(line, 'white'))
  if (blackWin && whiteWin) return 'draw'
  if (blackWin) return 'black'
  if (whiteWin) return 'white'

  // ここまで来たら 5連続は無い → 盤が満杯なら引き分け
  if (isBoardFull(board)) return 'draw'
  return null
}

export type Direction = { dr: number; dc: number }

/** マスがどの方向に押されるかを返す */
export function getPushDirection(
  row: number,
  col: number,
  size: number
): Direction {
  if (row === 0) return { dr: 1, dc: 0 }
  if (row === size - 1) return { dr: -1, dc: 0 }
  if (col === 0) return { dr: 0, dc: 1 }
  /* col === size-1 */ return { dr: 0, dc: -1 }
}

/** 
 * board[row][col] から始まる直線上を
 * dir の方向に 1 マスずつずらす
 */
export function shiftLine(
    board: BoardState,
    row: number,
    col: number,
    dir: Direction
  ) {
    const size = board.length
    // 1) 連続する occupied セルの座標を集める
    const occupied: { r: number; c: number }[] = []
    let r = row, c = col
    while (
      r >= 0 &&
      r < size &&
      c >= 0 &&
      c < size &&
      board[r][c] !== null
    ) {
      occupied.push({ r, c })
      r += dir.dr
      c += dir.dc
    }
  
    // 2) 「最後尾の次」がボード内かをチェック
    const isNextInBounds =
      r >= 0 && r < size && c >= 0 && c < size
  
    if (isNextInBounds) {
      // 空セルがあれば、末尾から先頭へ向かって１つずつ移動
      for (let i = occupied.length - 1; i >= 0; i--) {
        const { r: cr, c: cc } = occupied[i]
        board[cr + dir.dr][cc + dir.dc] = board[cr][cc]
      }
    } else {
      // ボード外にはじき出す場合は最後尾を消す
      for (let i = occupied.length - 1; i > 0; i--) {
        const { r: pr, c: pc } = occupied[i - 1]
        const { r: cr, c: cc } = occupied[i]
        board[cr][cc] = board[pr][pc]
      }
      // 最初の occupied[0] は後で上書き
    }
  }
