# 🩷ྀི🪼ྀི🩵ྀིペンタロール🩵ྀི🪼ྀི🩷ྀི
さまぁ〜ずチャンネルで紹介されていたペンタロールを作る<br>
https://youtu.be/B47Ptdt7M9M?si=KEYjF2hCA2DH73BX&t=70

# 🌙遊び方要約
>通常の五目並べと同じで5個並べた方の勝利（縦・横・斜め）<br>
盤面の端からボールを押しこんで入れてずらしていく<br>
すでにボールがある箇所にも押し込んで入れることができる（6個あるときは押しこみ不可）

# 🧸使用技術
- フロントエンドフレームワーク<br>
React + Vite<br>
- フロントエンド言語<br>
TypeScript<br>
- バックエンド関連<br>
CPU対戦モードでPython使用<br>

# 👻開発環境
- OS: MacBook Pro Sonoma 14.3<br>
- CPU: Apple M3 Pro / メモリ 36GB<br>
- Node.js: v23.10.0<br>
- npm: 10.9.2<br>
- Python: 3.13.2<br>




# ⭐️Create Branch 命名規則の例
~~（一人での作業だが、それっぽいreadmeを描きます）~~<br>
>・機能追加の場合:feature/〇〇 (例: feature/add-new-button)<br>
・バグ修正の場合:fix/〇〇 (例: fix/login-error)<br>
・リファクタリングの場合:refactor/〇〇 (例: refactor/improve-performance)<br>
・実験的な機能の場合:develop/〇〇 (例: develop/experimental-feature)<br>

統一しましょう。そうしましょう。


# ⚓️起動方法
## 🪼Pythonサーバー立ち上げる
AIモードを使う場合は、フロントエンドとは別に Python サーバを起動します。  
※ 開発中はターミナルを2つ使い、片方で Python、もう片方でフロントを起動してください。

### 必要条件
>- Python 3.10+（3.11 推奨）
>- pip

#### 1) ディレクトリに移動
```bash
cd Pentaroll-react/cpu-python
```
#### 2) 依存インストール＆起動
##### macOS / Linux
```bash
python3 -m venv .venv　 　　 # ① プロジェクト専用の仮想環境を作る
source .venv/bin/activate　　# ② その仮想環境を有効化する（Mac/Linux）
pip install -r requirements.txt　# ③ 依存ライブラリをインストール（fastapi/uvicorn/pydantic）
uvicorn main:app --reload --port 8001　# ④ 開発サーバ起動（/move エンドポイントが立つ）
```

##### Windows (PowerShell)
```bash
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001　
```
起動に成功すると、http://127.0.0.1:8001 で FastAPI が動きます。


## 🪼フロントエンドを立ち上げる

#### 1) flontendフォルダに移動します。
```bash
cd Pentaroll-react/frontend
```

#### 2) パッケージ依存関連インストール
```bash
npm insatall
```

#### 3) 開発環境起動
```bash
npm run dev
```
軌道に成功すると、http://localhost:5173 で ゲーム画面が開きます。


