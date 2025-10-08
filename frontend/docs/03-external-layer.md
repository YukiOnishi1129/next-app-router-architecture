# External層の設計

## 概要

External層は、**サーバーサイドでのみ実行される**コードを管理する層です。  
データベースアクセス、外部API連携、認証処理などを集約し、クライアントに公開すべきでないロジックを安全に実装します。  
この層は、Next.js App RouterのServer Componentsと密に連携しつつも、ドメイン層・アプリケーション層と明確に境界を持つことを重視します。

## 設計原則

### 1. Server-Only の徹底

- `command.server.ts`, `query.server.ts`, `service/**` などサーバー専用のファイルは、必ず先頭で `import 'server-only'` を宣言します。
- カスタムESLintルール `local-rules/require-server-only` が強制するため、宣言漏れはLintエラーになります。

```ts
// external/service/request/RequestWorkflowService.ts
import 'server-only'
```

### 2. DTO モジュールで入出力・スキーマを共有

- 入出力型と Zod スキーマは `external/dto/**` に集約します。
- Command/Query の server ファイルは DTO から import し、Action や index も同じ型を再利用します。
- `.action.ts` から型を再利用すると `restrict-action-imports` でLintエラーになるため、DTO経由が基本です。

```
external/dto/
├── auth/
│   ├── auth.command.dto.ts         # Commandの入力・レスポンス型 + Zodスキーマ
│   ├── auth.query.dto.ts           # Queryの入力・レスポンス型 + Zodスキーマ
│   └── index.ts                    # Barrel export
├── comment/
│   ├── comment.dto.ts              # 共通DTO
│   ├── comment.query.dto.ts
│   └── index.ts
├── request/
│   ├── request.dto.ts
│   ├── request.command.dto.ts
│   ├── request.query.dto.ts
│   └── index.ts
└── …（notification / user / attachment など）
```

ファイル役割は以下です。

- `*.dto.ts`: ドメインモデルから変換した純粋な DTO 型を提供。
- `*.command.dto.ts` / `*.query.dto.ts`: Zod スキーマと入出力型を定義。
- `index.ts`: Barrel export。Handler 側はここだけを import します。

### 3. CQRS で Command / Query を分割

External handler は Command と Query を明確に分離します。

```
external/handler/
└── auth/
    ├── shared.ts              # 共通サービス/コンテキスト
    ├── command.server.ts      # Server-only コマンド関数
    ├── command.action.ts      # Server Action (command)
    ├── query.server.ts        # Server-only クエリ関数
    └── query.action.ts        # Server Action (query)
```

- 命名は [AIP-190](https://google.aip.dev/190) の `動詞 + リソース` 形式 (`createSessionServer`, `listUsersServer` 等) に統一。
- `command.server.ts` / `query.server.ts` では `ZodError` でバリデーションエラーを判定し、DTO経由で型を管理します。
- `.action.ts` は Server Action として server 関数をラップするだけに留め、ビジネスロジックを持たせません。

```ts
// external/handler/auth/command.server.ts
import 'server-only'

import { cookies } from 'next/headers'
import { ZodError } from 'zod'

import {
  createSessionSchema,
  type CreateSessionInput,
  type CreateSessionResponse,
} from '@/external/dto/auth'

import {
  authService,
  userManagementService,
  auditService,
  SERVER_CONTEXT,
} from './shared'

export async function createSessionServer(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  try {
    const validated = createSessionSchema.parse(data)
    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    )
    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    })

    await auditService.logUserLogin(user, SERVER_CONTEXT)

    const cookieStore = await cookies()
    cookieStore.set('auth-token', authResult.idToken, { httpOnly: true, path: '/' })
    cookieStore.set('user-id', user.getId().getValue(), { httpOnly: true, path: '/' })

    return { success: true, redirectUrl: validated.redirectUrl ?? '/dashboard' }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid email or password format' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}
```

```ts
// external/handler/auth/command.action.ts
'use server'

import {
  createSessionServer,
  type CreateSessionInput,
  type CreateSessionResponse,
} from './command.server'

export async function createSessionAction(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  return createSessionServer(data)
}
```

## ディレクトリ構造

```
external/
├── dto/                    # DTO / スキーマ / Response 型
├── handler/                # Server Action エントリーポイント
│   ├── auth/
│   ├── user/
│   ├── request/
│   └── …
├── service/                # ビジネスロジック層
│   ├── auth/
│   ├── user/
│   └── …
├── repository/             # 永続化層（Drizzle 等）
│   ├── db/
│   └── index.ts
├── domain/                 # ドメインモデル・ビジネスルール
└── client/                 # 外部システムとの通信
    ├── db/
    ├── email/
    └── storage/
```

## Handler の実装パターン

### Command / Query 分割のルール

| ファイル              | 役割 |
|-----------------------|------|
| `command.server.ts`   | DTOからスキーマ/型を import し、サービス・リポジトリを呼び出すサーバー専用関数。`ZodError`で入力エラーを判定。|
| `command.action.ts`   | Server Action として上記 server 関数をラップ。クライアント/Server Componentから呼び出し可能。|
| `query.server.ts`     | 取得系処理を実装し、DTOのレスポンス型を返す。|
| `query.action.ts`     | Query server をラップする Server Action。|
| `shared.ts`           | サービスインスタンス生成、DTOへのマッピング関数等の共有ロジック。|

### DTO との連携例

```ts
// external/handler/request/query.server.ts
import 'server-only'

import { ZodError } from 'zod'
import { UserId } from '@/external/domain'

import {
  requestListSchema,
  type RequestListInput,
  type RequestListResponse,
} from '@/external/dto/request'

import {
  requestRepository,
  userManagementService,
  mapRequestToDto,
} from './shared'
import { getSessionServer } from '../auth/query.server'

export async function listMyRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = requestListSchema.parse(params ?? {})
    const requesterId = UserId.create(session.user.id)
    const requests = await requestRepository.findByRequesterId(
      requesterId,
      validated.limit,
      validated.offset
    )

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list requests',
    }
  }
}
```

## レイヤー連携の流れ

```
Client Component / Server Component
    ↓ (Server Action 呼び出し)
external/handler/**/command.action.ts
    ↓
external/handler/**/command.server.ts
    ↓
external/service/** (ビジネスロジック)
    ↓
external/repository/** (永続化)
```

- Server Action は DTO で定義された型を返すため、呼び出し側は型安全に処理できます。
- Handler は **薄いラッパー**に留め、ロジックは service / domain に委譲します。
- DTO で型を共有することで、Action・Server 間や他の handler からの再利用が容易になります。

## テスト指針

- Handler のテストでは DTO スキーマの検証を含め、`ZodError` の扱いを確認します。
- Service はドメインロジックのユニットテスト、Repository はデータソースのモックを通した統合テストを行います。
- 外部APIクライアントはモック化し、失敗時のエラーハンドリングを重点的に確認します。

## セキュリティ考慮事項

1. **環境変数の厳格な管理**
   - 秘密情報はすべて環境変数経由で取得し、Zod などで必須値を検証します。
2. **入力検証の徹底**
   - Command / Query server は DTO の Zod スキーマで必ず検証し、期待しないデータを流さない。
3. **エラーハンドリング**
   - 例外発生時は外部に詳細を漏らさず、DTO に沿ったエラー情報 (`{ success: false, error: string }`) を返します。

## まとめ

- External 層は Server-Only を徹底し、DTO モジュールを通じて型とバリデーションを一元管理します。
- Command / Query の分離と AIP-190 準拠の命名で、責務と呼び出し経路を明確に保ちます。
- カスタム ESLint ルールと DTO 化により、型の再利用や import 方針を統制しつつ、保守しやすい構成を実現しています。
