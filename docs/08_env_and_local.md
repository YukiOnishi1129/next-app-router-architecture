# 開発環境とローカルセットアップ

## 環境構築

### 必要なツール
- Node.js 18.17以上
- pnpm 8.0以上
- Docker & Docker Compose
- Git

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd next-app-router-architecture
```

2. **環境変数の設定**
```bash
# ルートディレクトリで
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

3. **PostgreSQLの起動**
```bash
# Docker Composeでデータベースを起動
docker compose up -d

# データベースの状態確認
docker compose ps
```

4. **依存関係のインストール**
```bash
cd frontend
pnpm install
```

5. **データベースのマイグレーション**
```bash
# Drizzle ORMでスキーマを適用
pnpm db:push

# または本番環境向けマイグレーション
pnpm db:migrate
```

6. **開発サーバーの起動**
```bash
pnpm dev
```

アプリケーションは http://localhost:3000 でアクセス可能です。

## Docker Compose設定

### compose.yml
```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: ${DB_CONTAINER_NAME}
    env_file:
      - ./.env
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - ${DB_PORT}:5432
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 20
      
volumes:
  pgdata:
```

### データベース管理コマンド
```bash
# データベース起動
docker compose up -d

# データベース停止
docker compose down

# データベースログ確認
docker compose logs -f db

# PostgreSQLコンソールアクセス
docker compose exec db psql -U $DB_USER -d $DB_NAME

# データベース完全リセット
docker compose down -v
docker compose up -d
```

## 環境変数

### .env.example
```bash
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=nextjs_app
DB_PORT=5432
DB_CONTAINER_NAME=nextjs-postgres

# Database URL (for Drizzle ORM)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Authentication
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# External APIs (optional)
RESEND_API_KEY=your_resend_api_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Environment
NODE_ENV=development
```

## 開発ツール

### VSCode設定

プロジェクトには以下のVSCode設定が含まれています：

- **自動保存**: 1秒後に自動保存
- **自動フォーマット**: 保存時にPrettierでフォーマット
- **ESLint**: 保存時に自動修正
- **Tailwind CSS**: クラス名の自動補完

### 推奨拡張機能
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- TypeScript語言機能

### 開発用スクリプト
```bash
# 開発サーバー起動
pnpm dev

# 型チェック
pnpm type-check

# リント実行
pnpm lint

# リント自動修正
pnpm lint:fix

# フォーマット
pnpm format

# フォーマットチェック
pnpm format:check

# テスト実行（ウォッチモード）
pnpm test

# テスト実行（UIモード）
pnpm test:ui

# テスト実行（CI用）
pnpm test:run

# カバレッジレポート
pnpm test:coverage

# ビルド
pnpm build

# 本番モード起動
pnpm start
```

## トラブルシューティング

### データベース接続エラー
```bash
# Docker コンテナの状態確認
docker ps

# データベースログ確認
docker compose logs db

# 接続テスト
docker compose exec db pg_isready
```

### ポート競合
既存のPostgreSQLサービスが動いている場合は、.envのDB_PORTを変更してください。

### 権限エラー
```bash
# node_modulesの権限修正
sudo chown -R $(whoami) node_modules

# キャッシュクリア
pnpm store prune
```

### TypeScriptエラー
```bash
# 型定義の再生成
pnpm type-check

# TypeScriptキャッシュクリア
rm -rf .next
pnpm dev
```

## 本番環境へのデプロイ

### Vercelへのデプロイ
1. Vercelアカウントでプロジェクトを作成
2. 環境変数を設定（DATABASE_URL等）
3. ビルドコマンド: `pnpm build`
4. 出力ディレクトリ: `.next`

### Dockerを使用したデプロイ
```dockerfile
# Dockerfile例
FROM node:18-alpine AS base

# 依存関係インストール
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# 実行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```