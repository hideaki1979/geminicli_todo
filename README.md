# Trello クローンアプリ

Next.js (App Router), NextAuth.js, dnd-kit を使用して作成した Trello 風のカンバンボードアプリケーションです。
ユーザー認証機能を備え、ドラッグ＆ドロップでタスクを直感的に管理できます。

※本アプリは Gemini-CLI を使って AI 駆動開発で作成したアプリです。

## 機能

- **認証機能**: NextAuth.js による認証システム
  - Credentials Provider を利用したデモ用ログイン
- **カンバンボード**:
  - リストとカードでタスクを可視化
  - ドラッグ＆ドロップによるカードの移動（リスト間・リスト内）
- **データ取得**: API Route からボードの初期データを取得
- **レスポンシブデザイン**: 様々なデバイスサイズに対応

## 技術スタック

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" alt="Next.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/eslint/eslint-original.svg" alt="ESLint" width="40" height="40"/>
</p>

- **Framework**: Next.js 15.3.5 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Authentication**: NextAuth.js 5.0.0-beta
- **UI**: React 19.1.0
- **Styling**: styled-components 6.1.19
- **Drag & Drop**:
  - @dnd-kit/core 6.3.1
  - @dnd-kit/sortable 10.0.0
- **Linting**: ESLint 9

## 開発環境の構築

### 前提条件

- Node.js 20 以上
- npm, yarn, pnpm, or bun

### インストールと実行

```bash
# リポジトリをクローン
git clone <repository-url>
cd gemini-cli-first

# 依存関係をインストール
npm install

# .env.localファイルを作成し、デモ用の認証情報を設定
# DEMO_USERNAME=your_username
# DEMO_PASSWORD=your_password

# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET="opensslで生成したシークレットキー"

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## スクリプト

```bash
# 開発サーバー起動（Turbopack）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# コード品質チェック
npm run lint
```

## プロジェクト構造

```
src/
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth.js の認証エンドポイント
│   │   └── board/route.ts   # ボードデータ取得API
│   ├── auth/signin/         # サインインページ
│   ├── page.tsx             # メインページ（カンバンボード）
│   └── layout.tsx           # ルートレイアウト
├── components/
│   ├── Board.tsx            # カンバンボード全体
│   ├── List.tsx             # タスクリスト
│   ├── Card.tsx             # タスクカード
│   ├── DndBoardContent.tsx  # D&Dロジックを含むボードコンテンツ
│   ├── Header.tsx           # アプリケーションヘッダー
│   └── Profile.tsx          # ユーザープロファイル表示
├── context/
│   └── BoardContext.tsx     # ボードの状態管理用Context
├── data/
│   └── board.json           # APIで返される初期データ
├── lib/
│   └── registry.tsx         # styled-components用レジストリ
├── types/
│   ├── index.ts             # プロジェクト共通の型定義
│   └── next-auth.d.ts       # NextAuth.jsの型拡張
└── auth.ts                  # NextAuth.js の設定ファイル

public/
└── ...                      # 静的ファイル

```

## 主要機能

### 1. 認証 (Authentication)

- **`src/auth.ts`**: NextAuth.js の設定の中心。`CredentialsProvider` を使用し、環境変数に設定されたユーザー名とパスワードで認証を行います。
- **`src/app/auth/signin/page.tsx`**: カスタムサインインページ。
- **セッション管理**: 認証されたユーザー情報はセッションで管理され、未認証の場合はサインインページにリダイレクトされます。

### 2. カンバンボード (Board)

- **`src/components/Board.tsx`**: ボード全体のレイアウトとリストのレンダリングを担当。
- **`src/components/List.tsx`**, **`src/components/Card.tsx`**: それぞれリストとカードの UI コンポーネント。
- **`@dnd-kit`**: ドラッグ＆ドロップ機能を提供。`DndContext` や `SortableContext` を利用して、カードの並べ替えやリスト間の移動を実現しています。
- **`src/context/BoardContext.tsx`**: `useContext` と `useReducer` を用いて、ボードの状態（リストやカードのデータ）をクライアントサイドで管理します。

## ライセンス

このプロジェクトは学習目的で作成されています。
