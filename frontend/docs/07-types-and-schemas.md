# 型定義とスキーマ

## 型定義の方針

このプロジェクトでは、TypeScriptの型安全性を最大限活用し、Zodスキーマから型を導出することで、ランタイムとコンパイルタイムの両方で型安全性を確保します。

## ディレクトリ構造

```
src/
├── shared/types/          # グローバル型定義
│   ├── api.ts            # API関連の共通型
│   ├── auth.ts           # 認証関連の型
│   └── common.ts         # 汎用的な型
├── features/
│   └── users/
│       ├── types/        # ユーザー機能固有の型
│       │   └── index.ts
│       └── schemas/      # Zodスキーマ
│           └── index.ts
└── external/
    └── types/            # 外部サービスの型定義
        └── identity-platform.ts
```

## Zodスキーマの活用

### 基本的なスキーマ定義

```typescript
// features/users/schemas/index.ts
import { z } from 'zod'

// 基本的なユーザースキーマ
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  emailVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// スキーマから型を導出
export type User = z.infer<typeof userSchema>

// 作成用スキーマ（IDと日付を除外）
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// 更新用スキーマ（部分的な更新を許可）
export const updateUserSchema = createUserSchema.partial()
export type UpdateUserInput = z.infer<typeof updateUserSchema>
```

### Google Cloud Identity Platform連携

```typescript
// external/types/identity-platform.ts
import { z } from 'zod'

// Identity Platform APIレスポンススキーマ
export const identityPlatformUserSchema = z.object({
  localId: z.string(), // Identity PlatformのユーザーID
  email: z.string().email().optional(),
  emailVerified: z.boolean().default(false),
  displayName: z.string().optional(),
  photoUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  disabled: z.boolean().default(false),
  createdAt: z.string(), // Unix timestamp in string
  lastLoginAt: z.string().optional(),
  customAttributes: z.string().optional(), // JSON string
  providerUserInfo: z.array(z.object({
    providerId: z.string(),
    federatedId: z.string(),
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    photoUrl: z.string().url().optional(),
  })).optional(),
})

export type IdentityPlatformUser = z.infer<typeof identityPlatformUserSchema>

// Google OAuth2 IDトークンのペイロードスキーマ
export const googleIdTokenPayloadSchema = z.object({
  iss: z.string(), // https://accounts.google.com
  azp: z.string(), // Authorized party (client ID)
  aud: z.string(), // Audience (client ID)
  sub: z.string(), // Subject (user ID)
  email: z.string().email(),
  email_verified: z.boolean(),
  at_hash: z.string().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  locale: z.string().optional(),
  iat: z.number(), // Issued at
  exp: z.number(), // Expiration
})

export type GoogleIdTokenPayload = z.infer<typeof googleIdTokenPayloadSchema>

// アプリケーション内で使用するセッショントークンのスキーマ
export const sessionTokenSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  exp: z.number(), // 有効期限（Unix timestamp）
})

export type SessionToken = z.infer<typeof sessionTokenSchema>
```

## 共通型定義

### APIレスポンス型

```typescript
// shared/types/api.ts
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, string[]> }

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// 使用例
type UsersResponse = ApiResponse<PaginatedResponse<User>>
```

### 認証関連の型

```typescript
// shared/types/auth.ts
import { z } from 'zod'
import { identityPlatformUserSchema } from '@/external/types/identity-platform'

// セッションスキーマ
export const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    image: z.string().url().nullable(),
    role: z.enum(['admin', 'user', 'guest']),
  }),
  idToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
})

export type Session = z.infer<typeof sessionSchema>

// 認証コンテキストの型
export interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

## 高度な型定義パターン

### ブランド型

```typescript
// shared/types/common.ts
type Brand<K, T> = K & { __brand: T }

export type UserId = Brand<string, 'UserId'>
export type OrderId = Brand<string, 'OrderId'>
export type ProductId = Brand<string, 'ProductId'>

// 型安全なID生成
export function createUserId(id: string): UserId {
  return id as UserId
}

// 使用例
function getUser(userId: UserId) {
  // UserIdのみ受け付ける
}

// エラー: OrderIdは受け付けない
// getUser(orderId)
```

### ユーティリティ型

```typescript
// shared/types/utils.ts
// 深いPartial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深いReadonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Nullable型
export type Nullable<T> = T | null

// 配列要素の型を取得
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// 使用例
const roles = ['admin', 'user', 'guest'] as const
type Role = ArrayElement<typeof roles> // 'admin' | 'user' | 'guest'
```

### 条件型

```typescript
// features/products/types/index.ts
export type ProductStatus = 'draft' | 'published' | 'archived'

export type ProductActions<T extends ProductStatus> = T extends 'draft'
  ? 'publish' | 'delete'
  : T extends 'published'
  ? 'archive' | 'update'
  : T extends 'archived'
  ? 'restore' | 'delete'
  : never

// 使用例
type DraftActions = ProductActions<'draft'> // 'publish' | 'delete'
type PublishedActions = ProductActions<'published'> // 'archive' | 'update'
```

## データベーススキーマとの連携

```typescript
// external/db/schema.ts
import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { userSchema } from '@/features/users/schemas'

// Enumの定義
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'guest'])

// テーブル定義
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  emailVerified: timestamp('email_verified'),
  identityPlatformUid: text('identity_platform_uid').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Drizzleの型とZodスキーマの連携
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type DbUser = InferSelectModel<typeof users>
export type NewDbUser = InferInsertModel<typeof users>

// バリデーション関数
export function validateDbUser(user: unknown): DbUser {
  return userSchema.parse(user)
}
```

## 型の自動生成

### tRPCライクな型推論

```typescript
// shared/lib/create-action.ts
import { z } from 'zod'

export function createAction<
  InputSchema extends z.ZodType,
  Output
>(config: {
  input: InputSchema
  handler: (input: z.infer<InputSchema>) => Promise<Output>
}) {
  return async (input: unknown) => {
    const validated = config.input.parse(input)
    return config.handler(validated)
  }
}

// 使用例
const createUserAction = createAction({
  input: createUserSchema,
  handler: async (input) => {
    // inputは自動的に型付けされる
    return await createUser(input)
  },
})
```

## ベストプラクティス

1. **スキーマファースト**: Zodスキーマから型を導出し、単一の真実の源を保つ
2. **厳密な型付け**: `any`や`unknown`の使用を最小限に
3. **型の再利用**: ユーティリティ型を活用して重複を避ける
4. **実行時検証**: 外部入力は必ずZodで検証
5. **型ガード**: 型の絞り込みを活用して型安全性を向上