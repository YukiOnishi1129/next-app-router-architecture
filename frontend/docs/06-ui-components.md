# UIコンポーネント設計

## Shadcn UIの活用

Shadcn UIは、Radix UIとTailwind CSSをベースにした、カスタマイズ可能なコンポーネントライブラリです。

### セットアップ

```bash
# Shadcn UIの初期化
pnpm dlx shadcn-ui@latest init

# コンポーネントの追加
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add dialog
```

### コンポーネントの構成

```
shared/components/
├── ui/                    # Shadcn UIコンポーネント
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ...
├── layout/               # レイアウトコンポーネント
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
└── common/              # カスタム共通コンポーネント
    ├── DataTable.tsx
    ├── ErrorBoundary.tsx
    └── LoadingSpinner.tsx
```

## コンポーネント設計原則

### 1. コンポジション優先

```typescript
// shared/components/common/Card.tsx
import { cn } from '@/shared/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export function Card({ 
  className, 
  variant = 'default', 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card text-card-foreground',
        {
          'border border-border': variant === 'outlined',
          'shadow-lg': variant === 'elevated',
        },
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}
```

### 2. 型安全なプロップス

```typescript
// features/users/components/UserAvatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { User } from '../types'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'image'>
  size?: 'sm' | 'md' | 'lg'
  showFallback?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const

export function UserAvatar({ 
  user, 
  size = 'md',
  showFallback = true 
}: UserAvatarProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={sizeClasses[size]}>
      {user.image && <AvatarImage src={user.image} alt={user.name} />}
      {showFallback && <AvatarFallback>{initials}</AvatarFallback>}
    </Avatar>
  )
}
```

### 3. アクセシブルなコンポーネント

```typescript
// shared/components/common/IconButton.tsx
import { forwardRef } from 'react'
import { Button, ButtonProps } from '../ui/button'
import { cn } from '@/shared/lib/utils'

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  label: string // アクセシビリティのため必須
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={label}
        className={cn('relative', className)}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'
```

## 高度なコンポーネントパターン

### データテーブル

```typescript
// shared/components/common/DataTable.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  データがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          前へ
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          次へ
        </Button>
      </div>
    </div>
  )
}
```

### モーダル管理

```typescript
// shared/components/common/ConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleConfirm() {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''}
          >
            {isLoading ? '処理中...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### スケルトンローディング

```typescript
// shared/components/common/UserCardSkeleton.tsx
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader } from './Card'

export function UserCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

// 使用例
export function UserList() {
  const { data: users, isLoading } = useUsers()

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

## レスポンシブデザイン

```typescript
// shared/components/layout/ResponsiveDialog.tsx
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { Dialog, DialogContent } from '../ui/dialog'
import { Drawer, DrawerContent } from '../ui/drawer'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  )
}
```

## テーマとスタイリング

```typescript
// shared/components/common/ThemeProvider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## ベストプラクティス

1. **コンポーネントの単一責任**: 各コンポーネントは一つの責務のみを持つ
2. **Props の明示的な型定義**: TypeScriptで全てのpropsに型を付ける
3. **アクセシビリティ優先**: ARIA属性、キーボードナビゲーション、スクリーンリーダー対応
4. **パフォーマンス最適化**: memo、useMemo、useCallbackの適切な使用
5. **エラーハンドリング**: Error BoundaryとSuspenseの活用