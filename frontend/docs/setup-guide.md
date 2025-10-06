# 開発環境セットアップガイド

## 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: 18.17以上
- **pnpm**: 8.0以上
- **Docker**: Docker Desktop または Docker Engine
- **Git**: バージョン管理用

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd next-app-router-architecture
```

### 2. 環境変数の設定

プロジェクトルートで環境変数ファイルを作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集し、必要な値を設定：

```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password  # 安全なパスワードに変更
DB_NAME=nextjs_app
DB_PORT=5432
DB_CONTAINER_NAME=nextjs-postgres

# Database URL (自動生成されるため変更不要)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Google Cloud Identity Platform
GCP_CLIENT_ID=your_client_id
GCP_CLIENT_SECRET=your_client_secret
GCP_IDENTITY_PLATFORM_API_KEY=your_api_key
NEXT_PUBLIC_GCP_CLIENT_ID=your_client_id  # フロントエンド用

# その他の設定
JWT_SECRET=your_jwt_secret_at_least_32_chars
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. PostgreSQLの起動

Docker Composeを使用してデータベースを起動：

```bash
# データベースコンテナを起動
docker compose up -d

# 起動確認
docker compose ps

# ログを確認（問題がある場合）
docker compose logs -f db
```

### 4. フロントエンドのセットアップ

```bash
# frontendディレクトリに移動
cd frontend

# 依存関係をインストール
pnpm install

# Drizzle ORMの設定（初回のみ）
pnpm drizzle-kit generate
pnpm db:push
```

### 5. 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスします。

## VSCode設定

### 推奨拡張機能のインストール

VSCodeで開発する場合、以下の拡張機能をインストールしてください：

1. VSCodeでプロジェクトを開く
2. 拡張機能タブ（Cmd/Ctrl + Shift + X）を開く
3. 「@recommended」で検索
4. 推奨される拡張機能をすべてインストール

または、コマンドパレット（Cmd/Ctrl + Shift + P）で：
```
Extensions: Show Recommended Extensions
```

### 自動的に適用される設定

プロジェクトには以下の設定が含まれています：

- **自動保存**: 1秒後に自動保存
- **フォーマット**: 保存時にPrettierで自動整形
- **リント**: 保存時にESLintで自動修正
- **インポート**: 保存時に未使用のインポートを自動削除

## 開発ワークフロー

### 新しい機能の追加

1. **feature ブランチの作成**
   ```bash
   git checkout -b feat/new-feature
   ```

2. **必要なUIコンポーネントの追加**
   ```bash
   pnpm dlx shadcn-ui@latest add <component-name>
   ```

3. **開発とテスト**
   ```bash
   # 開発サーバーで確認
   pnpm dev

   # テストの実行
   pnpm test

   # 型チェック
   pnpm type-check

   # リントとフォーマット
   pnpm lint:fix
   pnpm format
   ```

### データベーススキーマの変更

1. **スキーマファイルの編集**
   ```typescript
   // external/db/schema.ts
   export const newTable = pgTable('new_table', {
     id: uuid('id').primaryKey().defaultRandom(),
     // ... カラム定義
   })
   ```

2. **マイグレーションの生成と適用**
   ```bash
   # マイグレーションファイルの生成
   pnpm drizzle-kit generate

   # 開発環境に適用
   pnpm db:push

   # または本番用マイグレーション
   pnpm db:migrate
   ```

## トラブルシューティング

### ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL

# プロセスを終了
kill -9 <PID>

# またはポートを変更（.envファイルで設定）
```

### データベース接続エラー

```bash
# PostgreSQLコンテナの状態確認
docker compose ps
docker compose logs db

# データベースに直接接続してテスト
docker compose exec db psql -U $DB_USER -d $DB_NAME

# コンテナの再起動
docker compose restart db
```

### 依存関係のエラー

```bash
# node_modulesをクリア
rm -rf node_modules pnpm-lock.yaml

# キャッシュをクリア
pnpm store prune

# 再インストール
pnpm install
```

### TypeScriptエラー

```bash
# TypeScriptのキャッシュをクリア
rm -rf .next

# 型定義の再生成
pnpm type-check

# VSCodeのTypeScriptを再起動
# Command Palette: TypeScript: Restart TS Server
```

## よく使うコマンド

```bash
# 開発
pnpm dev              # 開発サーバー起動
pnpm build            # プロダクションビルド
pnpm start            # プロダクションサーバー起動

# コード品質
pnpm lint             # ESLint実行
pnpm lint:fix         # ESLint自動修正
pnpm format           # Prettierフォーマット
pnpm format:check     # フォーマットチェック
pnpm type-check       # TypeScript型チェック

# テスト
pnpm test             # テスト実行（ウォッチモード）
pnpm test:ui          # Vitest UI起動
pnpm test:run         # テスト実行（CI用）
pnpm test:coverage    # カバレッジレポート生成

# データベース
pnpm db:push          # スキーマを同期（開発用）
pnpm db:migrate       # マイグレーション実行
pnpm db:studio        # Drizzle Studio起動
```

## 次のステップ

1. [アーキテクチャ](./architecture.md) - プロジェクトの全体構造を理解
2. [ディレクトリ構成](./01-directory-structure.md) - ファイル配置の規則
3. [技術スタック詳細](./02-tech-stack.md) - 使用技術の詳細
4. [開発ガイドライン](./README.md) - コーディング規約とベストプラクティス