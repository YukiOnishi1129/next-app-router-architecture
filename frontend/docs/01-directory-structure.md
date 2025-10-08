# ディレクトリ構成

## 概要

このプロジェクトでは、機能ベースのディレクトリ構成を採用し、保守性と拡張性を重視した構造になっています。

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証が必要なルートグループ
│   │   ├── (public)/          # 公開ルートグループ
│   │   ├── api/               # API Routes（必要な場合）
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── globals.css        # グローバルスタイル
│   │
│   ├── external/              # バックエンド専用処理
│   │   ├── db/               # データベース接続・クエリ
│   │   ├── actions/          # Server Actions
│   │   └── services/         # 外部API連携
│   │
│   ├── features/             # 機能別モジュール
│   │   ├── auth/            # 認証機能
│   │   ├── users/           # ユーザー管理
│   │   ├── products/        # 商品管理
│   │   └── orders/          # 注文管理
│   │
│   └── shared/              # 共通モジュール
│       ├── components/      # 共通コンポーネント
│       ├── hooks/          # カスタムフック
│       ├── lib/            # ユーティリティ
│       └── types/          # 型定義
│
├── public/                  # 静的ファイル
├── docs/                   # ドキュメント
└── tests/                  # テストファイル
```

## 各ディレクトリの役割

### `/src/app`

Next.js App Routerのルートディレクトリ。ルーティングとレイアウトを管理。

- **ルートグループ**: `(auth)`や`(public)`で認証の有無を分離
- **レイアウト**: 共通レイアウトの定義
- **ローディング/エラー**: 各ルートのローディング状態とエラーハンドリング

### `/src/external`

サーバーサイドでのみ実行されるコードを格納。クライアントバンドルには含まれない。

- **必須**: すべてのファイルで`import 'server-only'`を使用
- **用途**: DB接続、API秘密鍵の使用、サーバー専用ロジック

### `/src/features`

機能単位でコードを整理。各機能は独立したモジュールとして管理。

```
features/users/
├── components/        # ユーザー機能専用コンポーネント
├── hooks/            # ユーザー機能専用フック
├── schemas/          # Zodスキーマ定義
├── queries/          # TanStack Query定義
└── types/            # 型定義
```

### `/src/shared`

アプリケーション全体で共有されるコード。

- **components/ui**: Shadcn UIコンポーネント
- **components/layout**: ヘッダー、フッター等のレイアウト
- **hooks**: 汎用的なカスタムフック
- **lib**: ユーティリティ関数、設定

## ベストプラクティス

### 1. インポートパスの管理

```typescript
// 推奨: パスエイリアスを使用
import { Button } from "@/shared/components/ui/button";
import { useUser } from "@/features/users/hooks/useUser";

// 非推奨: 相対パス
import { Button } from "../../../shared/components/ui/button";
```

### 2. 機能の独立性

各featureは他のfeatureに直接依存しない。共通の依存はsharedを経由する。

### 3. External層の使用

```typescript
// external/db/users.ts
import "server-only";
import { db } from "./client";

export async function getUsers() {
  return await db.select().from(users);
}

// external/actions/users.ts
("use server");
import { getUsers } from "../db/users";

export async function fetchUsersAction() {
  return await getUsers();
}
```

### 4. 型定義の配置

- グローバル型: `/src/shared/types`
- 機能固有型: `/src/features/[feature]/types`
- スキーマ由来の型: Zodスキーマから自動生成
