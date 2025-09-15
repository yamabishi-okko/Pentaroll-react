import type { CellValue } from './CellValue'

export type BoardState = CellValue[][]

/**
 * size×size の空盤面を作る
 * 例: createEmptyBoard(7) → 7×7の null 埋め配列
 */
export const createEmptyBoard = (size: number): BoardState => {
  return Array.from({ length: size }, () =>
    Array<CellValue>(size).fill(null)
  )
}