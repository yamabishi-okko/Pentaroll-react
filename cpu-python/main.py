from typing import List, Literal, Optional, Tuple
from fastapi import FastAPI
from pydantic import BaseModel
import random

Player = Literal["black", "white"] # 手番が白瀬か黒瀬か
Cell = Optional[Player]  # なにもない / "黒駒" / "白駒"

class MoveRequest(BaseModel):
    board: List[List[Cell]]  # 6x6
    currentPlayer: Player

class MoveResponse(BaseModel):
    row: int
    col: int

app = FastAPI(title="PentaRoll CPU (Random)")

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

@app.post("/move", response_model=MoveResponse)
def get_move(req: MoveRequest):
    # リクエストで送られてきた盤面（req.board）から置ける場所を探す
    choices = clickable_positions(req.board)
    if not choices:
        # 置けない場合は (0,0) 返し（本来はパス/勝敗判定など）
        return MoveResponse(row=0, col=0)

    # choices の中からランダムに1つ選ぶ
    row, col = random.choice(choices)
    # その座標を返す
    return MoveResponse(row=row, col=col)
# APIのエンドポイント /move を作る。
# React側が POST リクエストを送ると、
# → Pythonが「置けるマス」をランダムで選んで返す。