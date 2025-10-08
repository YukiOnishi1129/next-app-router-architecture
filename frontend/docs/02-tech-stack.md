# 技術スタック詳細

## フロントエンドフレームワーク

### Next.js 15 (App Router)

- **Server Components**: デフォルトでサーバーサイドレンダリング
- **Server Actions**: フォーム処理とデータ変更
- **Streaming**: 段階的なページレンダリング
- **Route Handlers**: APIエンドポイント（必要な場合）

## データフェッチング

### TanStack Query (React Query)

クライアントサイドのデータフェッチングとキャッシュ管理。

```typescript
// features/requests/queries/useRequestList.ts
import { useQuery } from '@tanstack/react-query'
import { listRequestsAction } from '@/external/handler/request/query.action'
import { requestFilterSchema } from '@/features/requests/schemas/requestFilter'

export const useRequestList = (rawFilters: unknown) => {
  const filters = requestFilterSchema.parse(rawFilters)
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => listRequestsAction(filters),
    staleTime: 1000 * 60 * 5, // 5分
  })
}
```

### キャッシュ戦略

- **Stale While Revalidate**: バックグラウンドで最新データを取得
- **Optimistic Updates**: 楽観的更新でUXを向上
- **Prefetching**: ページ遷移前のデータプリフェッチ

## フォーム管理

### React Hook Form + Zod

型安全なフォーム実装とバリデーション。

```typescript
// features/requests/schemas/createRequest.ts
import { z } from 'zod'

export const createRequestSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(['expense', 'purchase', 'access']),
  amount: z
    .union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)])
    .optional()
    .transform(value => (typeof value === 'string' ? Number(value) : value)),
  reason: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(10),
  approverId: z.string().uuid(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
```

```typescript
// features/requests/components/client/RequestForm/RequestFormContainer.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createRequestSchema,
  type CreateRequestInput,
} from '@/features/requests/schemas/createRequest'
import { createRequestAction } from '@/features/requests/actions/createRequest.action'
import { RequestFormPresenter } from './RequestFormPresenter'

export function RequestFormContainer() {
  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      type: 'expense',
      amount: undefined,
      reason: '',
      attachments: [],
      approverId: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await createRequestAction(data)
  })

  return <RequestFormPresenter form={form} onSubmit={handleSubmit} />
}
```

## UIコンポーネント

### Shadcn UI

- **カスタマイズ可能**: Tailwind CSSベースで柔軟なスタイリング
- **アクセシビリティ**: Radix UIベースでアクセシブル
- **型安全**: TypeScriptで完全な型定義

```typescript
// shared/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
```

## データベース

### PostgreSQL + Drizzle ORM

型安全なデータベース操作。

```typescript
// external/client/db/schema/requests.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core'

export const requests = pgTable('requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: text('type').notNull(), // expense | purchase | access
  amount: numeric('amount'),
  reason: text('reason').notNull(),
  attachments: jsonb('attachments').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('draft'),
  requesterId: uuid('requester_id').notNull(),
  approverId: uuid('approver_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// external/client/db/client.ts
import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

## 開発ツール

### ESLint + Prettier

- **コード品質**: ESLintで一貫性のあるコード
- **フォーマット**: Prettierで自動整形
- **VSCode統合**: 保存時に自動修正

### TypeScript

- **Strict Mode**: 厳格な型チェック
- **Path Aliases**: クリーンなインポートパス
- **型推論**: 可能な限り型推論を活用
