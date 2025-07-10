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
  - タスク・リストの追加、編集、削除
  - 楽観的 UI 更新によるスムーズな操作感
- **データ永続化**: API Route 経由で Vercel KV にボードの状態を保存

## 技術スタック

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" alt="Next.js" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" alt="TypeScript" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/eslint/eslint-original.svg" alt="ESLint" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg" alt="Jest" width="40" height="40" />
</p>

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript 5
- **Authentication**: NextAuth.js 5.0.0-beta.29
- **UI**: React 19.1.0
- **Styling**: styled-components 6.1.19
- **Drag & Drop**:
  - @dnd-kit/core 6.3.1
  - @dnd-kit/sortable 10.0.0
- **Data Fetching/Persistence**:
  - Vercel KV (@vercel/kv)
- **Validation**: Zod
- **Testing**: Jest, React Testing Library
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
# NEXTAUTH_SECRET="opensslで生成したシークレットキー(openssl rand -base64 32)"

# 開発サーバーを起動（Turbopackを利用する場合は next dev --turbo）
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# コード品質チェック
npm run lint

# テスト実行
npm run test
```

## プロジェクト構造

```
src/
├── app/
│   ├── api/                 # API Routes
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth.js 認証エンドポイント
│   │   └── board/route.ts   # ボードデータ取得/更新API
│   ├── auth/signin/         # サインインページ
│   ├── profile/             # プロフィールページ
│   ├── page.tsx             # メインページ（カンバンボード）
│   └── layout.tsx           # ルートレイアウト
├── components/
│   ├── Board.tsx            # カンバンボード全体
│   ├── List.tsx             # タスクリスト
│   ├── Card.tsx             # タスクカード
│   ├── DndBoardContent.tsx  # D&Dロジックを含むボードコンテンツ
│   ├── Header.tsx           # アプリケーションヘッダー
│   ├── Profile.tsx          # ユーザープロファイル表示
│   ├── Modal.tsx            # 汎用モーダルコンポーネント
│   └── ...                  # その他UIコンポーネント
├── context/
│   ├── BoardContext.tsx     # ボードの状態管理と操作ロジック
│   └── BoardContext.test.tsx# BoardContextのテスト
├── data/
│   └── board.json           # APIで返される初期データ（開発用）
├── lib/
│   └── registry.tsx         # styled-components用レジストリ
├── types/
│   ├── index.ts             # プロジェクト共通の型定義
│   └── next-auth.d.ts       # NextAuth.jsの型拡張
├── validation/
│   └── boardValidation.ts   # Zodによるボードデータのバリデーションスキーマ
└── auth.ts                  # NextAuth.js の設定ファイル

public/
└── ...                      # 静的ファイル

```

## 主要機能

### 1. 認証 (Authentication)

- **`src/auth.ts`**: NextAuth.js の設定の中心。`CredentialsProvider` を使用し、環境変数に設定されたユーザー名とパスワードで認証を行います。
- **`src/app/auth/signin/page.tsx`**: カスタムサインインページ。
- **セッション管理**: 認証されたユーザー情報はセッションで管理され、未認証の場合はサインインページにリダイレクトされます。`callbacks` を用いて、セッション情報にユーザー ID を含めています。

### 2. カンバンボード (Board)

- **`src/components/Board.tsx`**: ボード全体のレイアウトとリストのレンダリングを担当。
- **`src/components/List.tsx`**, **`src/components/Card.tsx`**: それぞれリストとカードの UI コンポーネント。
- **`@dnd-kit`**: ドラッグ＆ドロップ機能を提供。`DndContext` や `SortableContext` を利用して、カードの並べ替えやリスト間の移動を実現しています。
- **状態管理とデータ永続化**:
  - **`src/context/BoardContext.tsx`**: `useState` と `useCallback` を用いて、ボードの状態（リストやカードのデータ）をクライアントサイドで管理します。
  - **楽観的 UI 更新**: ユーザーの操作（タスク追加・移動など）を即座に UI へ反映させ、バックグラウンドで API 通信を行います。通信に失敗した場合は、UI の状態を元に戻し、エラーメッセージを表示します。これにより、スムーズなユーザー体験を実現しています。
  - **API (`/api/board`)**: フロントエンドからのリクエストを受け取り、Vercel KV を使用してボードのデータを永続化します。データの検証には `Zod` (`src/validation/boardValidation.ts`) を利用しています。

## ライセンス

このプロジェクトは学習目的で作成されています。
