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
├── ui/                             # Shadcn UIベースの低レベルコンポーネント
│   ├── button.tsx
│   ├── form.tsx
│   └── badge.tsx
├── layout/
│   ├── server/                     # 認証ラッパーなどのServer Components
│   │   └── AuthenticatedLayoutWrapper/
│   └── client/                     # ヘッダーやサイドバーのClient Components
│       ├── Header/
│       └── Sidebar/
└── feedback/                       # トースト・スケルトンなど横断的UI
    ├── ToastProvider.tsx
    └── RequestListSkeleton.tsx

### Server Components と `server-only`

- `features/**/components/server/**` 直下のファイルは **Server Components 専用ディレクトリ** として扱います。
- これらのコンポーネントでは `import 'server-only'` を記述する必要はありません。Next.js が自動判別し、カスタム ESLint ルールもこのディレクトリを Server 専用として扱います。
- Server 専用のロジック (認証チェックなど) を外部の `servers/` ユーティリティに切り出す場合は、ユーティリティ側で `import 'server-only'` を宣言してください。
```

## コンポーネント設計原則

### 1. コンポジション優先

```typescript
// shared/components/ui/request-status-badge.tsx
import { Badge, type BadgeProps } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

const STATUS_VARIANT: Record<RequestStatus, BadgeProps['variant']> = {
  draft: 'outline',
  submitted: 'default',
  approved: 'success',
  rejected: 'destructive',
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

type RequestStatusBadgeProps = {
  status: RequestStatus
  className?: string
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn('capitalize', className)}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
```

### 2. 型安全なプロップス

```typescript
// features/requests/components/client/RequestSummaryCard/RequestSummaryCardPresenter.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import type { RequestSummary } from '@/features/requests/types'

type RequestSummaryCardPresenterProps = {
  request: RequestSummary
  onClick: (requestId: string) => void
}

export function RequestSummaryCardPresenter({
  request,
  onClick,
}: RequestSummaryCardPresenterProps) {
  return (
    <Card role="button" onClick={() => onClick(request.id)} className="transition hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-base font-semibold">{request.title}</CardTitle>
        <RequestStatusBadge status={request.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Type: {request.typeLabel}</p>
        <p>Amount: {request.amountFormatted ?? '—'}</p>
        <p>Last updated: {request.updatedAtRelative}</p>
      </CardContent>
    </Card>
  )
}
```

### 追加: Container / Presenter パターン

Client ComponentsはContainer/Presenter/Hookの三層構成を採用します。

```typescript
// features/approvals/components/client/ApprovalDecisionForm/ApprovalDecisionFormContainer.tsx
'use client'
import { useApprovalDecisionForm } from './useApprovalDecisionForm'
import { ApprovalDecisionFormPresenter } from './ApprovalDecisionFormPresenter'

export function ApprovalDecisionFormContainer({ requestId }: { requestId: string }) {
  const { form, handleApprove, handleReject, isSubmitting } = useApprovalDecisionForm({ requestId })
  return (
    <ApprovalDecisionFormPresenter
      form={form}
      onApprove={handleApprove}
      onReject={handleReject}
      isSubmitting={isSubmitting}
    />
  )
}
```

```typescript
// features/approvals/components/client/ApprovalDecisionForm/useApprovalDecisionForm.ts
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { approvalDecisionSchema } from '@/features/approvals/schemas/approvalDecision'
import { approveRequestAction, rejectRequestAction } from '@/features/approvals/actions'
import type { ApprovalDecisionInput } from '@/features/approvals/types'

export const useApprovalDecisionForm = ({ requestId }: { requestId: string }) => {
  const form = useForm<ApprovalDecisionInput>({
    resolver: zodResolver(approvalDecisionSchema),
    defaultValues: { comment: '' },
  })

  const handleApprove = useCallback(
    async (input: ApprovalDecisionInput) => {
      await approveRequestAction({ ...input, requestId })
    },
    [requestId],
  )

  const handleReject = useCallback(
    async (input: ApprovalDecisionInput) => {
      await rejectRequestAction({ ...input, requestId })
    },
    [requestId],
  )

  return {
    form,
    handleApprove: form.handleSubmit(handleApprove),
    handleReject: form.handleSubmit(handleReject),
    isSubmitting: form.formState.isSubmitting,
  }
}
```

### 3. アクセシブルなコンポーネント

```typescript
// shared/components/ui/icon-button.tsx
import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  label: string // アクセシビリティのため必須
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, ...props }, ref) => (
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
  ),
)

IconButton.displayName = 'IconButton'
```

## 高度なコンポーネントパターン

### データテーブル

```typescript
// shared/components/table/DataTable.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
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
