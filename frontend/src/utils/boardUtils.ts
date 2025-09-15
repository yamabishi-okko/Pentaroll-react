// src/utils/boardUtils.ts
import type { BoardState } from '../types/BoardState'
import type { PlayerColor } from '../types/PlayerColor'

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
