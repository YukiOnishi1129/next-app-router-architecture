# Custom Hooks Design Guidelines

## Why We Use Hooks

カスタムフックは React のロジックを再利用・分離するための重要な仕組みです。  
このプロジェクトでは **機能単位 (features)** と **共通ユーティリティ (shared)** の双方でフックを活用し、以下を狙います。

- Server Component を薄く保つ
- UI ロジック・状態管理をテストしやすくする
- TanStack Query や React Hook Form など共通ライブラリの扱い方を統一する

## 命名と配置ルール

```
src/
├── features/
│   └── {feature}/
│       └── hooks/
│           └── useFeatureName.ts
└── shared/
    └── hooks/
        └── useSharedUtility.ts
```

- ファイル名・関数名は `use` から始める。
- フィーチャー固有のフックは `src/features/**/hooks` 配下に置く。
- プロジェクト全体で再利用するフックは `src/shared/hooks` に置き、依存を最小化する。

## 基本パターン

### ステート管理フック

```ts
// shared/hooks/useDisclosure.ts
import { useCallback, useState } from 'react'

export const useDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
```

- 小さな UI 状態 (モーダル、ドロワー等) を扱う場合によく使います。
- `useCallback` でハンドラーをメモ化し、子コンポーネントへの props 渡しが多い場合でも無駄な再レンダリングを避けます。

### データ取得フック

```ts
// features/threads/hooks/useThreadList.ts
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { threadKeys } from '@/features/thread/queries/keys'
import { listThreadQueryAction } from '@/external/handler/thread/query.action'
import { SIDEBAR_THREAD_COUNT_PER_PAGE } from '../constants'
import { useStreamingMessage } from './useStreamingMessage'

export const useThreadList = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: threadKeys.sidebar(),
      queryFn: ({ pageParam = 0 }) =>
        listThreadQueryAction({
          limit: SIDEBAR_THREAD_COUNT_PER_PAGE + 1,
          offset: pageParam,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length > SIDEBAR_THREAD_COUNT_PER_PAGE
          ? pages.length * SIDEBAR_THREAD_COUNT_PER_PAGE
          : undefined,
      staleTime: 5 * 60 * 1000,
    })

  const { streamInitialMessage } = useStreamingMessage()

  const createThread = useCallback(
    async (message: string, isDeep: boolean) => {
      await streamInitialMessage(message, isDeep, {
        onComplete: () => {
          // 必要であればここでキャッシュ更新
        },
      })
    },
    [streamInitialMessage]
  )

  return {
    threads: data?.pages.flatMap((page) => page) ?? [],
    isLoading,
    error,
    createThread,
    loadMore: fetchNextPage,
    hasNextPage,
  }
}
```

- TanStack Query を包むフックは **キー生成 (`threadKeys`) と Action 呼び出し** をまとめ、RSC からでも扱いやすい形で返す。
- `useCallback` でミューテーションのハンドラーをラップし、依存配列を明示する。

## フォーム系フック

### 単一フォーム

```ts
// features/auth/hooks/useLoginForm.ts
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { loginAction } from '@/external/handler/auth/command.action'
import { ValidationError } from '@/shared/lib/errors'
import { toast } from '@/shared/lib/toast'
import { loginSchema, type LoginFormData } from '../schemas/login'

export const useLoginForm = () => {
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginAction,
    onSuccess: () => {
      toast.success('ログインしました')
      router.push('/dashboard')
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        form.setError('root', { message: error.message })
        return
      }
      toast.error('ログインに失敗しました')
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    login(data)
  })

  return {
    form,
    handleSubmit,
    isPending,
  }
}
```

- `react-hook-form` と `zodResolver` を組み合わせ、バリデーションを集中管理。
- Server Action (`loginAction`) の結果をハンドリングし、トーストや画面遷移を行う。

### マルチステップフォーム

```ts
// features/account/hooks/usePasswordResetForm.ts
export const usePasswordResetForm = () => {
  const [currentStep, setCurrentStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')

  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) })

  const sendCodeMutation = useMutation({
    mutationFn: sendResetCodeAction,
    onSuccess: () => {
      setCurrentStep('reset')
      toast.success('認証コードを送信しました')
    },
  })

  const resetMutation = useMutation({
    mutationFn: resetPasswordAction,
    onSuccess: () => {
      toast.success('パスワードを更新しました')
      router.push('/login')
    },
  })

  const handleEmailSubmit = emailForm.handleSubmit((data) => {
    setEmail(data.email)
    sendCodeMutation.mutate(data)
  })

  const handleResetSubmit = resetForm.handleSubmit((data) => {
    resetMutation.mutate({ ...data, email })
  })

  return {
    currentStep,
    emailForm,
    resetForm,
    handleEmailSubmit,
    handleResetSubmit,
    isPending: sendCodeMutation.isPending || resetMutation.isPending,
  }
}
```

- `Stepper` UI など複雑な UI でも、状態遷移とフォーム処理をフックにまとめることでコンポーネントをシンプルに保てます。

## TanStack Query ラッパーフック

### 単純な Query ラッパー

```ts
// features/threads/hooks/query/useLoadThreadMessagesQuery.ts
export const useLoadThreadMessagesQuery = (threadId: string) => {
  return useQuery({
    queryKey: threadKeys.messages(threadId),
    queryFn: () => loadThreadMessagesAction({ threadId }),
    enabled: !!threadId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
```

- `enabled` フラグや `staleTime` をひとまとめにし、呼び出し側は `useQuery` の詳細を意識せず利用できるようにする。

### キャッシュ更新を含む複合フック

```ts
// features/threads/hooks/useThreadMessages.ts
export const useThreadMessages = (threadId?: string) => {
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading } =
    useLoadThreadMessagesQuery(threadId ?? '')

  const addMessage = useCallback(
    (message: Message) => {
      if (!threadId) return
      queryClient.setQueryData<Message[]>(threadKeys.messages(threadId), (old = []) => [
        ...old,
        message,
      ])
    },
    [threadId, queryClient]
  )

  const updateMessage = useCallback(
    (id: string, updates: Partial<Message>) => {
      if (!threadId) return
      queryClient.setQueryData<Message[]>(threadKeys.messages(threadId), (old = []) =>
        old.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
      )
    },
    [threadId, queryClient]
  )

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
  }
}
```

- TanStack Query のキャッシュを直接扱う処理はフックに閉じ込め、コンポーネントは `messages`, `addMessage` といった明確な API だけを使う。

### Infinite Query

```ts
// features/threads/hooks/useInfiniteThreads.ts
export const useInfiniteThreads = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: threadKeys.list(),
    queryFn: ({ pageParam = 0 }) => listThreadsAction({ offset: pageParam, limit: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * 20 : undefined,
  })

  const threads = useMemo(
    () => data?.pages.flatMap((page) => page.threads) ?? [],
    [data]
  )

  return {
    threads,
    loadMore: fetchNextPage,
    hasNextPage,
    isLoadingMore: isFetchingNextPage,
  }
}
```

- `useInfiniteQuery` のページングロジックもフック内で完結させ、UI は `loadMore()` を呼ぶだけで次ページを取得できるようにする。

## 高度なユーティリティフック

### Debounced Search

```ts
// shared/hooks/useDebouncedSearch.ts
import { useCallback, useEffect, useState } from 'react'

export const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T[]>,
  delay = 300
) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchFn(query)
        setResults(data)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [query, searchFn, delay])

  return {
    query,
    setQuery,
    results,
    isSearching,
  }
}
```

- 入力補完や検索ボックスなどで利用。外部API呼び出しの頻度を抑制。

### Local Storage と同期する

```ts
// shared/hooks/useLocalStorage.ts
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}"`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
          return valueToStore
        })
      } catch (error) {
        console.error(`Error setting localStorage key "${key}"`, error)
      }
    },
    [key]
  )

  return [storedValue, setValue]
}
```

- Server Component では `window` が存在しないため、防御的なガードを入れる。

## ベストプラクティス

### 1. 単一責務

```ts
// ✅ 良い例: 認証専用のロジックだけを扱う
export const useAuth = () => {
  // ...
}

// ✅ 良い例: プロフィール情報の取得・更新だけに集中
export const useUserProfile = () => {
  // ...
}

// ❌ NG: 複数責務が混ざる
export const useUserData = () => {
  // 認証・プロフィール・設定などがミックスされている
}
```

### 2. 依存関係の最適化

```ts
export const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial)

  const increment = useCallback(() => setCount((prev) => prev + 1), [])
  const decrement = useCallback(() => setCount((prev) => prev - 1), [])
  const reset = useCallback(() => setCount(initial), [initial])

  return { count, increment, decrement, reset }
}
```

- 依存配列を適切に書かないと無限ループや不要な再実行が発生。  
  ESLint (`react-hooks/exhaustive-deps`) の指摘を活かす。

### 3. エラー処理

```ts
export const useAsyncOperation = <T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>
) => {
  const [state, setState] = useState<{
    data: T | null
    error: Error | null
    isLoading: boolean
  }>({ data: null, error: null, isLoading: false })

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, error: null, isLoading: true })
      try {
        const data = await asyncFn(...args)
        setState({ data, error: null, isLoading: false })
        return data
      } catch (error) {
        setState({
          data: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
          isLoading: false,
        })
        throw error
      }
    },
    [asyncFn]
  )

  return { ...state, execute }
}
```

- フック内部で try/catch を扱い、呼び出し元では単純な `execute()` インターフェースを使えるようにする。

### 4. テストしやすさ

```ts
// hooks/__tests__/useCounter.test.ts
import { act, renderHook } from '@testing-library/react'

import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('increments the counter', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

- フックはテスト可能な純粋関数として設計し、外部依存を注入可能にする (例: Search API を引数で受け取る)。

## まとめ

- **再利用性**: 共通ロジックをフックにまとめ、複数コンポーネントで共有する。
- **責務分離**: 単一責務を徹底し、複雑な処理はフックを分割して組み合わせる。
- **外部ライブラリの統一的な扱い**: TanStack Query、React Hook Form、localStorage などの扱いを共通化する。
- **テスト容易性**: `renderHook` やモックを使ったユニットテストを書きやすい構造を意識する。

チーム内でフックの設計方針を共有し、Server Component / Client Component の責務を整理しながら開発することで、より保守性の高い UI を実現できます。
