from typing import List, Literal, Optional, Tuple
from fastapi import FastAPI
from pydantic import BaseModel
import random

Player = Literal["black", "white"] # 手番が白瀬か黒瀬か
Cell = Optional[Player]  # なにもない / "黒駒" / "白駒"

class MoveRequest(BaseModel):
    board: List[List[Cell]]  # 6x6
    currentPlayer: Player
    mode: str = "cpu-easy"  # "cpu-easy" | "cpu-medium"

class MoveResponse(BaseModel):
    row: int
    col: int

app = FastAPI(title="PentaRoll CPU")

def is_row_full(board: List[List[Cell]], r: int) -> bool:
    # board の各行から c 列目を取り出してチェック
    # 全部 None じゃなければ「その列は満杯」と判断
    return all(cell is not None for cell in board[r])


def is_col_full(board: List[List[Cell]], c: int) -> bool:
    # board の各行から c 列目を取り出してチェック
    # 全部 None じゃなければ「その列は満杯」と判断
    return all(row[c] is not None for row in board)

def is_edge(size: int, r: int, c: int) -> bool:
    # 端っこ判定
    # 行が 0 or size-1 か、列が 0 or size-1 なら端っこ
    return r == 0 or c == 0 or r == size - 1 or c == size - 1

def is_corner(size: int, r: int, c: int) -> bool:
    # 角っこ判定
    # 行が 0 か size-1 かつ、列も 0 か size-1 の場合は四隅
    return (r == 0 or r == size - 1) and (c == 0 or c == size - 1)


# def is_row_full(board, r): ...
# def is_col_full(board, c): ...
# def is_edge(size, r, c): ...
# def is_corner(size, r, c): ...
# 行が満杯？ 列が満杯？ 端っこ？ 角っこ？ 塩っこ？ …などを調べる。


def get_push_direction(r: int, c: int, size: int) -> Tuple[int, int]:
    # TypeScript の getPushDirection と同じロジック
    # 上辺→下に押す / 下辺→上に押す / 左辺→右に押す / 右辺→左に押す
    if r == 0:          return (1, 0)
    if r == size - 1:   return (-1, 0)
    if c == 0:          return (0, 1)
    return (0, -1)


def get_effective_direction(board: List[List[Cell]], r: int, c: int, size: int) -> Tuple[int, int]:
    # フロントエンドが allowCornerModal:false のときに自動選択する方向と同じロジック
    # コーナー → 列に空きがあれば縦方向、なければ横方向
    # それ以外 → get_push_direction と同じ
    if not is_corner(size, r, c):
        return get_push_direction(r, c, size)
    if not is_col_full(board, c):
        dr = 1 if r == 0 else -1
        return (dr, 0)
    else:
        dc = 1 if c == 0 else -1
        return (0, dc)


def shift_line(board: List[List[Cell]], r: int, c: int, dr: int, dc: int) -> None:
    # boardUtils.ts の shiftLine を Python に移植
    # board をその場で変更する（破壊的操作）
    size = len(board)
    # 1) 連続する occupied セルの座標を集める
    occupied: List[Tuple[int, int]] = []
    rr, cc = r, c
    while 0 <= rr < size and 0 <= cc < size and board[rr][cc] is not None:
        occupied.append((rr, cc))
        rr += dr
        cc += dc

    # 2) 「最後尾の次」がボード内かをチェック
    is_next_in_bounds = 0 <= rr < size and 0 <= cc < size

    if is_next_in_bounds:
        # 空セルがあれば、末尾から先頭へ向かって１つずつ移動
        for i in range(len(occupied) - 1, -1, -1):
            pr, pc = occupied[i]
            board[pr + dr][pc + dc] = board[pr][pc]
    else:
        # ボード外にはじき出す場合は最後尾を消す
        for i in range(len(occupied) - 1, 0, -1):
            pr, pc = occupied[i - 1]
            cr, cc2 = occupied[i]
            board[cr][cc2] = board[pr][pc]
        # 最初の occupied[0] は呼び出し元が上書きする


def simulate_move(
    board: List[List[Cell]], r: int, c: int, dr: int, dc: int, player: Player
) -> List[List[Cell]]:
    # board をコピーして1手を適用した新盤面を返す（元の board は変えない）
    new_board = [row[:] for row in board]
    if new_board[r][c] is None:
        new_board[r][c] = player
    else:
        shift_line(new_board, r, c, dr, dc)
        new_board[r][c] = player
    return new_board


def clickable_positions(board: List[List[Cell]]) -> List[Tuple[int, int]]:
    size = len(board) # 盤面の大きさ（6x6なら6）
    res: List[Tuple[int, int]] = []  # 結果を入れる配列（置ける座標のリスト）
    for r in range(size):   # 行を1つずつループ
        for c in range(size):  # 列を1つずつループ
            if not is_edge(size, r, c): # 端じゃなければスキップ
                continue
            if is_corner(size, r, c):
                # 四隅：行 or 列のどちらかに空きがあればOK
                if (not is_row_full(board, r)) or (not is_col_full(board, c)):
                    res.append((r, c))
            else:
                top_or_bottom = (r == 0 or r == size - 1)
                left_or_right = (c == 0 or c == size - 1)
                if top_or_bottom and not is_col_full(board, c):
                    res.append((r, c))
                elif left_or_right and not is_row_full(board, r):
                    res.append((r, c))
    return res
# 現在の盤面で「合法手（置ける場所）」を全部探す関数。


# ── 勝敗判定（boardUtils.ts の checkWinnerFive 相当） ──────────

def has_five_in_line(cells: List[Cell], color: Player) -> bool:
    # 1列内で color が5連続あるか
    run = 0
    for v in cells:
        if v == color:
            run += 1
            if run >= 5:
                return True
        else:
            run = 0
    return False


def is_board_full(board: List[List[Cell]]) -> bool:
    # 盤面がすべて埋まっているか
    return all(cell is not None for row in board for cell in row)


def enumerate_all_lines(board: List[List[Cell]]) -> List[List[Cell]]:
    # 盤の全"列"（行・列・斜め）を列挙（長さ5以上のみ）
    n = len(board)
    lines = []

    # 行
    for r in range(n):
        lines.append(list(board[r]))

    # 列
    for c in range(n):
        lines.append([board[r][c] for r in range(n)])

    # 斜め ↘（左上→右下）
    for r0 in range(n):
        diag, i = [], 0
        while r0 + i < n and i < n:
            diag.append(board[r0 + i][i])
            i += 1
        if len(diag) >= 5:
            lines.append(diag)

    for c0 in range(1, n):
        diag, i = [], 0
        while i < n and c0 + i < n:
            diag.append(board[i][c0 + i])
            i += 1
        if len(diag) >= 5:
            lines.append(diag)

    # 斜め ↙（右上→左下）
    for r0 in range(n):
        diag, i = [], 0
        while r0 + i < n and n - 1 - i >= 0:
            diag.append(board[r0 + i][n - 1 - i])
            i += 1
        if len(diag) >= 5:
            lines.append(diag)

    for c0 in range(n - 2, -1, -1):
        diag, i = [], 0
        while i < n and c0 - i >= 0:
            diag.append(board[i][c0 - i])
            i += 1
        if len(diag) >= 5:
            lines.append(diag)

    return lines


def check_winner(board: List[List[Cell]]) -> Optional[str]:
    # boardUtils.ts の checkWinnerFive と同一ロジック
    lines = enumerate_all_lines(board)
    black_win = any(has_five_in_line(line, "black") for line in lines)
    white_win = any(has_five_in_line(line, "white") for line in lines)
    if black_win and white_win:
        return "draw"
    if black_win:
        return "black"
    if white_win:
        return "white"
    if is_board_full(board):
        return "draw"
    return None


# ── 中級AI ─────────────────────────────────────────────────────

def medium_move(board: List[List[Cell]], player: Player) -> Tuple[int, int]:
    # 1手先読みで手を選ぶ
    # 優先度: 自分が即勝ちできる手 > 相手の即勝ちをブロック > ランダム
    size = len(board)
    opponent: Player = "white" if player == "black" else "black"
    positions = clickable_positions(board)

    if not positions:
        return (0, 0)

    # 1) 自分が勝てる手を探す
    for r, c in positions:
        dr, dc = get_effective_direction(board, r, c, size)
        new_board = simulate_move(board, r, c, dr, dc, player)
        if check_winner(new_board) == player:
            return (r, c)

    # 2) 相手が勝てる手をブロック
    for r, c in positions:
        dr, dc = get_effective_direction(board, r, c, size)
        new_board = simulate_move(board, r, c, dr, dc, opponent)
        if check_winner(new_board) == opponent:
            return (r, c)

    # 3) どちらもなければランダム
    return random.choice(positions)


@app.post("/move", response_model=MoveResponse)
def get_move(req: MoveRequest):
    # リクエストで送られてきた盤面（req.board）から置ける場所を探す
    if req.mode == "cpu-medium":
        # 中級：1手先読みで手を決める
        row, col = medium_move(req.board, req.currentPlayer)
    else:
        # 初級：choices の中からランダムに1つ選ぶ
        choices = clickable_positions(req.board)
        if not choices:
            # 置けない場合は (0,0) 返し（本来はパス/勝敗判定など）
            return MoveResponse(row=0, col=0)
        row, col = random.choice(choices)

    # その座標を返す
    return MoveResponse(row=row, col=col)
# APIのエンドポイント /move を作る。
# React側が POST リクエストを送ると、
# → Pythonが「置けるマス」をランダムで選んで返す。