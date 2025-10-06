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

### 2. Server Actionsの活用
フォーム送信やデータ変更処理にServer Actionsを使用。

```typescript
// external/actions/users.ts
'use server'

import { z } from 'zod'
import { db } from '../db/client'
import { users } from '../db/schema'
import { revalidatePath } from 'next/cache'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export async function createUserAction(formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await db.insert(users).values(validatedFields.data)
    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    return { error: 'ユーザーの作成に失敗しました' }
  }
}
```

## ディレクトリ構造

```
external/
├── db/                  # データベース関連
│   ├── client.ts       # DB接続設定
│   ├── schema.ts       # スキーマ定義
│   └── queries/        # 複雑なクエリ
│
├── actions/            # Server Actions
│   ├── auth.ts        # 認証関連アクション
│   ├── users.ts       # ユーザー関連アクション
│   └── products.ts    # 商品関連アクション
│
├── services/          # 外部API連携
│   ├── email.ts      # メール送信サービス
│   ├── storage.ts    # ファイルストレージ
│   └── payment.ts    # 決済サービス
│
└── lib/              # ユーティリティ
    ├── auth.ts       # 認証ヘルパー
    └── crypto.ts     # 暗号化処理
```

## 実装パターン

### データベースクエリ
```typescript
// external/db/queries/users.ts
import 'server-only'
import { db } from '../client'
import { users, posts } from '../schema'
import { eq } from 'drizzle-orm'

export async function getUserWithPosts(userId: number) {
  return await db
    .select()
    .from(users)
    .leftJoin(posts, eq(users.id, posts.authorId))
    .where(eq(users.id, userId))
}
```

### 外部API連携
```typescript
// external/services/email.ts
import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  return await resend.emails.send({
    from: 'noreply@example.com',
    to: email,
    subject: 'Welcome!',
    html: `<h1>Welcome, ${name}!</h1>`,
  })
}
```

### 認証処理
```typescript
// external/lib/auth.ts
import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24時間
  })
}

export async function verifySession() {
  const sessionCookie = cookies().get('session')
  if (!sessionCookie) return null

  try {
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    return payload as { userId: number }
  } catch {
    return null
  }
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