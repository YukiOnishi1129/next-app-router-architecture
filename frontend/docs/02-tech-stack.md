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
// features/users/queries/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { fetchUsersAction } from "@/external/actions/users";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsersAction,
    staleTime: 1000 * 60 * 5, // 5分
  });
};
```

### キャッシュ戦略

- **Stale While Revalidate**: バックグラウンドで最新データを取得
- **Optimistic Updates**: 楽観的更新でUXを向上
- **Prefetching**: ページ遷移前のデータプリフェッチ

## フォーム管理

### React Hook Form + Zod

型安全なフォーム実装とバリデーション。

```typescript
// features/users/schemas/userSchema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  age: z.number().min(0).max(150),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

```typescript
// features/users/components/UserForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserInput } from '../schemas/userSchema'

export function UserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0,
    },
  })

  const onSubmit = async (data: CreateUserInput) => {
    // Server Actionを呼び出し
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* フォームフィールド */}
    </form>
  )
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
// external/db/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// external/db/client.ts
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
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
