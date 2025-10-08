# 状態管理とデータフェッチング

## 状態管理の方針

Next.js App Routerでは、状態管理を以下の3つのレベルで考えます：

1. **サーバー状態**: TanStack Queryで管理
2. **フォーム状態**: React Hook Formで管理
3. **UI状態**: React StateまたはZustand（複雑な場合）で管理

## TanStack Query

### セットアップ

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1分
          gcTime: 5 * 60 * 1000, // 5分（旧cacheTime）
          refetchOnWindowFocus: false,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### クエリの実装

```typescript
// features/users/queries/useUsers.ts
import { useQuery } from '@tanstack/react-query'
import { fetchUsersAction } from '@/external/actions/users'

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsersAction(filters),
    staleTime: 5 * 60 * 1000, // 5分
  })
}

// features/users/queries/useUser.ts
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUserAction(userId),
    enabled: !!userId,
  })
}
```

### ミューテーションの実装

```typescript
// features/users/mutations/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUserAction } from '@/external/actions/users'
import { toast } from '@/shared/components/ui/toast'

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUserAction,
    onSuccess: (data) => {
      // キャッシュの無効化
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      // 楽観的更新
      queryClient.setQueryData(['users', data.id], data)
      
      toast.success('ユーザーを作成しました')
    },
    onError: (error) => {
      toast.error('ユーザーの作成に失敗しました')
    },
  })
}
```

### 楽観的更新

```typescript
// features/todos/mutations/useToggleTodo.ts
export const useToggleTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleTodoAction,
    onMutate: async (todoId) => {
      // 再フェッチをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // 前の状態を保存
      const previousTodos = queryClient.getQueryData(['todos'])

      // 楽観的更新
      queryClient.setQueryData(['todos'], (old: Todo[]) => {
        return old.map(todo =>
          todo.id === todoId
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      })

      return { previousTodos }
    },
    onError: (err, todoId, context) => {
      // エラー時はロールバック
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },
    onSettled: () => {
      // 完了後に再フェッチ
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

## Server Components でのデータフェッチング

### 基本的なパターン

```typescript
// app/users/page.tsx
import { getUsers } from '@/external/db/users'
import { UserList } from '@/features/users/components/UserList'

export default async function UsersPage() {
  const users = await getUsers()

  return <UserList initialUsers={users} />
}
```

### Suspenseを使った並列フェッチ

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { UserStats } from '@/features/users/components/UserStats'
import { RecentOrders } from '@/features/orders/components/RecentOrders'

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading user stats...</div>}>
        <UserStats />
      </Suspense>
      <Suspense fallback={<div>Loading orders...</div>}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

// features/users/components/UserStats.tsx
async function UserStats() {
  const stats = await getUserStats()
  return <div>{/* stats表示 */}</div>
}
```

## ハイドレーション戦略

### プリフェッチとハイドレーション

```typescript
// features/users/components/UserList.tsx
'use client'

import { useUsers } from '../queries/useUsers'

export function UserList({ initialUsers }: { initialUsers: User[] }) {
  const { data: users = initialUsers } = useUsers()

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### HydrationBoundaryの使用

```typescript
// app/users/page.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getUsers } from '@/external/db/users'

export default async function UsersPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserListClient />
    </HydrationBoundary>
  )
}
```

## グローバル状態管理

複雑なクライアント状態が必要な場合は、Zustandを使用：

```typescript
// shared/stores/useAppStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
          })),
        toggleSidebar: () =>
          set((state) => ({
            sidebarOpen: !state.sidebarOpen,
          })),
      }),
      {
        name: 'app-storage',
      }
    )
  )
)
```

## ベストプラクティス

1. **Server Componentsを優先**: 可能な限りサーバーでデータを取得
2. **適切なキャッシュ戦略**: staleTimeとgcTimeを適切に設定
3. **エラーバウンダリー**: データフェッチングエラーを適切にハンドル
4. **ローディング状態**: Suspenseとスケルトンスクリーンを活用
5. **型安全性**: すべてのクエリとミューテーションに型を付与