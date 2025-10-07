# External層の設計

## 概要

External層は、サーバーサイドでのみ実行されるコードを管理する重要な層です。データベースアクセス、外部API連携、認証処理など、クライアントに公開すべきでない処理を安全に実装します。

## 設計原則

### 1. Server-Onlyの徹底
すべてのExternal層のファイルで`import 'server-only'`を使用し、クライアントバンドルへの混入を防ぎます。

```typescript
// external/db/client.ts
import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

export const db = drizzle(client)
```

### 2. CQRS構成のハンドラー
ExternalのhandlerはCommand/Queryを明確に分離し、Server FunctionsとServer Actionsの2層で管理します。

```
external/handler/
└── auth/
    ├── shared.ts              # 共通サービス/コンテキスト
    ├── command.server.ts      # Server-only command handlers
    ├── command.action.ts      # Server Actions (command)
    ├── query.server.ts        # Server-only query handlers
    └── query.action.ts        # Server Actions (query)
```

Commandファイルでは「作成・更新・削除」などの状態変更を、Queryファイルでは「取得系」を扱います。命名は[AIP-190](https://google.aip.dev/190)に準拠し、例えば`createSessionServer`, `deleteSessionServer`, `getSessionServer`など動詞+リソースで統一します。

Server-only関数をServer Actionから利用することで、クライアントコンポーネントはActionを透過的に呼び出せるようにします。

```typescript
// external/handler/auth/command.server.ts
import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { authService, userManagementService, auditService, SERVER_CONTEXT } from "./shared";

const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: z.string().url().optional(),
});

export type CreateSessionInput = z.input<typeof createSessionSchema>;

export async function createSessionServer(data: CreateSessionInput) {
  const validated = createSessionSchema.parse(data);
  const authResult = await authService.signInWithEmailPassword(
    validated.email,
    validated.password
  );
  const user = await userManagementService.getOrCreateUser({
    email: authResult.userInfo.email,
    name: authResult.userInfo.name,
    externalId: authResult.userInfo.id,
  });
  await auditService.logUserLogin(user, SERVER_CONTEXT);

  const cookieStore = await cookies();
  cookieStore.set("auth-token", authResult.idToken, { httpOnly: true, path: "/" });
  cookieStore.set("user-id", user.getId().getValue(), { httpOnly: true, path: "/" });

  return { success: true, redirectUrl: validated.redirectUrl ?? "/dashboard" };
}

// external/handler/auth/command.action.ts
'use server';
import { createSessionServer, type CreateSessionInput } from "./command.server";

export async function createSessionAction(data: CreateSessionInput) {
  return createSessionServer(data);
}
```

## ディレクトリ構造

```
external/
├── handler/            # エントリーポイント（Server Actions）
│   ├── auth/          # 認証関連ハンドラー
│   ├── user/          # ユーザー関連ハンドラー
│   └── product/       # 商品関連ハンドラー
│
├── service/            # ビジネスロジック層
│   ├── auth/          # 認証サービス
│   ├── user/          # ユーザーサービス
│   └── product/       # 商品サービス
│
├── domain/             # ドメインモデル・ビジネスルール
│   ├── user/          # ユーザードメイン
│   ├── product/       # 商品ドメイン
│   └── order/         # 注文ドメイン
│
└── client/             # 外部システムとの通信
    ├── db/            # データベースクライアント
    │   ├── client.ts  # DB接続
    │   └── schema/    # スキーマ定義
    ├── gcp/           # Google Cloud Platform
    │   └── identity-platform.ts
    ├── email/         # メールサービス
    └── storage/       # ストレージサービス
```

## 実装パターン

### ハンドラーのCommand/Query分割

External handlerはCQRSスタイルで構成し、クエリとコマンドを明確に分けます。

- `*_server.ts`: `import "server-only"` を宣言し、直接サービスやリポジトリを呼び出す純粋なサーバー関数。
- `*_action.ts`: Server Actionとしてエクスポートし、クライアントコンポーネントやRSCから呼び出し可能にするラッパー。
- `shared.ts`: 同一リソース内で共通利用するサービス初期化やコンテキスト。

命名は[Google AIP-190](https://google.aip.dev/190)に基づき、操作 + リソース形 (例: `createSessionServer`, `listUsersServer`) を採用します。

```typescript
// external/handler/auth/command.server.ts
export async function createSessionServer(data: CreateSessionInput) { ... }
export async function createUserServer(data: CreateUserInput) { ... }
export async function deleteSessionServer(userId?: string) { ... }

// external/handler/auth/query.server.ts
export async function getSessionServer(data?: GetSessionInput) { ... }
export async function checkPermissionServer(permission: string) { ... }

// external/handler/auth/command.action.ts
'use server'
export async function createSessionAction(data: CreateSessionInput) {
  return createSessionServer(data)
}
```

これにより、Server Components / API Route / Client Components からの呼び出し先を明確化し、テストや責務の分離が容易になります。

### レイヤー間の連携

```typescript
// 1. Handler層（エントリーポイント）
// external/handler/user/create.ts
'use server'

import { createUserSchema } from '@/features/users/schemas'
import { userService } from '@/external/service/user'
import { revalidatePath } from 'next/cache'

export async function createUserAction(input: unknown) {
  const validated = createUserSchema.safeParse(input)
  
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const user = await userService.createUser(validated.data)
    revalidatePath('/users')
    return { success: true, data: user }
  } catch (error) {
    return { 
      success: false, 
      error: 'ユーザーの作成に失敗しました' 
    }
  }
}

// 2. Service層（ビジネスロジック）
// external/service/user/index.ts
import 'server-only'
import { UserDomain, type CreateUserData } from '@/external/domain/user'
import { userRepository } from '@/external/client/db/repository/user'
import { emailClient } from '@/external/client/email'

export const userService = {
  async createUser(data: CreateUserData) {
    // ドメインルールの検証
    const userDomain = new UserDomain(data)
    const errors = userDomain.validate()
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    // ユーザー作成
    const user = await userRepository.create(userDomain.toEntity())
    
    // ウェルカムメール送信
    await emailClient.sendWelcomeEmail(user.email, user.name)
    
    return user
  },

  async findByEmail(email: string) {
    return await userRepository.findByEmail(email)
  },
}

// 3. Domain層（ビジネスルール）
// external/domain/user/index.ts
export interface CreateUserData {
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
}

export class UserDomain {
  constructor(private data: CreateUserData) {}

  validate(): string[] {
    const errors: string[] = []
    
    // ビジネスルールの検証
    if (this.data.email.includes('+')) {
      errors.push('プラス記号を含むメールアドレスは使用できません')
    }
    
    if (this.data.role === 'admin' && !this.data.email.endsWith('@company.com')) {
      errors.push('管理者は会社のメールアドレスを使用する必要があります')
    }
    
    return errors
  }

  toEntity() {
    return {
      email: this.data.email.toLowerCase(),
      name: this.data.name.trim(),
      role: this.data.role,
      emailVerified: false,
      createdAt: new Date(),
    }
  }
}

// 4. Client層（外部システム連携）
// external/client/db/repository/user.ts
import 'server-only'
import { db } from '../client'
import { users } from '../schema/users'
import { eq } from 'drizzle-orm'

export const userRepository = {
  async create(userData: any) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning()
    
    return user
  },

  async findByEmail(email: string) {
    return await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
  },
}
```

### Google Cloud Identity Platform連携

```typescript
// external/client/gcp/identity-platform.ts
import 'server-only'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const IDENTITY_PLATFORM_BASE_URL = `https://identitytoolkit.googleapis.com/v1`
const API_KEY = process.env.GCP_IDENTITY_PLATFORM_API_KEY

export const identityPlatformClient = {
  async verifyIdToken(idToken: string) {
    const response = await fetch(
      `${IDENTITY_PLATFORM_BASE_URL}/accounts:lookup?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )

    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    const data = await response.json()
    return data.users?.[0]
  },

  async refreshToken(refreshToken: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GCP_CLIENT_ID!,
        client_secret: process.env.GCP_CLIENT_SECRET!,
        grant_type: 'refresh_token',
      }),
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    return await response.json()
  },
}
```

## セキュリティ考慮事項

### 1. 環境変数の管理
```typescript
// すべての秘密情報は環境変数から取得
const apiKey = process.env.EXTERNAL_API_KEY!

// 型安全な環境変数
const env = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  EXTERNAL_API_KEY: z.string(),
}).parse(process.env)
```

### 2. 入力検証
```typescript
// Server Actionでは必ず入力を検証
export async function updateUserAction(userId: number, data: unknown) {
  const schema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  })

  const validated = schema.safeParse(data)
  if (!validated.success) {
    throw new Error('Invalid input')
  }

  // 処理を続行
}
```

### 3. エラーハンドリング
```typescript
// センシティブな情報を含まないエラーメッセージ
try {
  await db.insert(users).values(data)
} catch (error) {
  console.error('Database error:', error)
  return { error: '処理中にエラーが発生しました' }
}
```

## テスト

External層のテストは、実際のデータベースやAPIをモックして行います。

```typescript
// external/db/queries/users.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../client'
import { getUserWithPosts } from './users'

vi.mock('../client', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(mockData)),
        })),
      })),
    })),
  },
}))

describe('getUserWithPosts', () => {
  it('ユーザーと投稿を取得する', async () => {
    const result = await getUserWithPosts(1)
    expect(result).toEqual(mockData)
  })
})
```
