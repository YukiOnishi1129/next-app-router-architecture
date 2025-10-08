# Data Fetching Patterns (Server & Client)

This guide documents how the Request & Approval System performs data fetching across Server Components and Client Components. It builds on the TanStack Query guide (`04-state-management.md`) and the routing documentation (`11-routing-and-layouts.md`) to provide end-to-end patterns for fast, secure, and maintainable data access.

---

## 1. Server-Side Data Fetching

Server Components (including PageTemplates and layout wrappers) perform the initial data fetch so that pages render fully on the first response. TanStack Query is used to pre-populate the client cache via `HydrationBoundary`.

### 1.1 PageTemplate Prefetch

```typescript
// features/requests/components/server/RequestsPageTemplate/RequestsPageTemplate.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { requestKeys } from '@/features/requests/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'
import { RequestList } from '@/features/requests/components/client/RequestList'

type RequestsPageTemplateProps = {
  filters: RequestFilterInput
}

export async function RequestsPageTemplate({ filters }: RequestsPageTemplateProps) {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => listRequestsAction(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequestList filters={filters} />
    </HydrationBoundary>
  )
}
```

### 1.2 Dynamic Routes with Error Handling

```typescript
// features/requests/components/server/RequestDetailPageTemplate/RequestDetailPageTemplate.tsx
import { notFound, redirect } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { requestKeys } from '@/features/requests/queries/keys'
import { getRequestAction } from '@/external/handler/request/query.action'
import { RequestDetail } from '@/features/requests/components/client/RequestDetail'
import { BusinessError } from '@/external/service/errors'

type Props = {
  requestId: string
  highlightCommentId?: string
}

export async function RequestDetailPageTemplate({ requestId, highlightCommentId }: Props) {
  const queryClient = getQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: requestKeys.detail(requestId),
      queryFn: () => getRequestAction({ requestId }),
    })
  } catch (error) {
    if (error instanceof BusinessError) {
      if (error.code === 'REQUEST_NOT_FOUND') {
        notFound()
      }
      if (error.code === 'PERMISSION_DENIED') {
        redirect('/unauthorized')
      }
    }
    throw error
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RequestDetail requestId={requestId} highlightCommentId={highlightCommentId} />
    </HydrationBoundary>
  )
}
```

### 1.3 Page Components with `PageProps`

```typescript
// app/(authenticated)/requests/[requestId]/page.tsx
import type { PageProps } from 'next'
import { RequestDetailPageTemplate } from '@/features/requests/components/server/RequestDetailPageTemplate'

export default async function RequestDetailPage(
  props: PageProps<'/(authenticated)/requests/[requestId]'>,
) {
  const { requestId } = await props.params
  const { highlight } = await props.searchParams

  return (
    <RequestDetailPageTemplate
      requestId={requestId}
      highlightCommentId={highlight}
    />
  )
}
```

### 1.4 Parallel Prefetching (Dashboard)

```typescript
// features/dashboard/components/server/DashboardPageTemplate/DashboardPageTemplate.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { getSessionServer } from '@/features/auth/servers/session.server'
import { requestKeys } from '@/features/requests/queries/keys'
import { approvalKeys } from '@/features/approvals/queries/keys'
import { notificationKeys } from '@/features/notifications/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'
import { listPendingApprovalsAction } from '@/external/handler/approval/query.action'
import { listNotificationsAction } from '@/external/handler/notification/query.action'
import { Dashboard } from '@/features/dashboard/components/client/Dashboard'

export async function DashboardPageTemplate() {
  const queryClient = getQueryClient()
  const session = await getSessionServer()
  if (!session?.user) throw new Error('Unauthorized')

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: requestKeys.summary(session.user.id),
      queryFn: () => listRequestsAction({ requesterId: session.user.id, limit: 5 }),
    }),
    queryClient.prefetchQuery({
      queryKey: approvalKeys.pending(session.user.id),
      queryFn: () => listPendingApprovalsAction({ approverId: session.user.id }),
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: notificationKeys.list(),
      queryFn: ({ pageParam = 0 }) =>
        listNotificationsAction({ offset: pageParam, limit: 10 }),
      initialPageParam: 0,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  )
}
```

### 1.5 Layout Prefetch (Authenticated Shell)

```typescript
// shared/components/layout/server/AuthenticatedLayoutWrapper/AuthenticatedLayoutWrapper.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { approvalKeys } from '@/features/approvals/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'
import { listPendingApprovalsAction } from '@/external/handler/approval/query.action'
import { listDraftRequestsAction } from '@/external/handler/request/query.action'
import { Sidebar } from '@/shared/components/layout/client/Sidebar'
import { Header } from '@/shared/components/layout/client/Header'

const SIDEBAR_LIMIT = 6

export async function AuthenticatedLayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await requireAuthServer()
  const queryClient = getQueryClient()

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: approvalKeys.pending(session.user.id),
        queryFn: () => listPendingApprovalsAction({ approverId: session.user.id }),
      }),
      queryClient.prefetchQuery({
        queryKey: requestKeys.drafts(session.user.id),
        queryFn: () => listDraftRequestsAction({ requesterId: session.user.id, limit: SIDEBAR_LIMIT }),
      }),
    ])
  } catch (error) {
    console.error('Failed to prefetch layout data', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </HydrationBoundary>
  )
}
```

---

## 2. Client-Side Data Fetching

Client Components rely on TanStack Query hooks for interactivity (filters, actions, infinite scroll). Data fetching happens via server actions to keep credentials and business logic on the server.

### 2.1 Query Hooks

```typescript
// features/requests/hooks/query/useRequestListQuery.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'

export const useRequestListQuery = (filters: RequestFilterInput) =>
  useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => listRequestsAction(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
```

```tsx
// features/requests/components/client/RequestList/RequestListContainer.tsx
'use client'

import { useRequestListQuery } from '@/features/requests/hooks/query/useRequestListQuery'
import { RequestListPresenter } from './RequestListPresenter'
import { RequestListSkeleton } from './RequestListSkeleton'

export function RequestList({ filters }: { filters: RequestFilterInput }) {
  const { data, isLoading, isFetching, error } = useRequestListQuery(filters)

  if (isLoading) return <RequestListSkeleton />
  if (error) return <RequestListPresenter.Error error={error} />

  return (
    <RequestListPresenter
      requests={data?.items ?? []}
      total={data?.total ?? 0}
      isRefetching={isFetching}
    />
  )
}
```

### 2.2 Mutations with Optimistic UI

```typescript
// features/approvals/hooks/mutation/useApproveRequestMutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { approveRequestAction } from '@/external/handler/approval/command.action'
import { toast } from '@/shared/components/ui/use-toast'

export const useApproveRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveRequestAction,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.detail(input.requestId) })

      const previous = queryClient.getQueryData<RequestDetail>(
        requestKeys.detail(input.requestId),
      )

      queryClient.setQueryData<RequestDetail>(
        requestKeys.detail(input.requestId),
        (old) =>
          old
            ? {
                ...old,
                status: 'approved',
                approvalHistory: [
                  {
                    actorName: old.currentUserName,
                    action: 'approved',
                    comment: input.comment ?? '',
                    occurredAt: new Date().toISOString(),
                  },
                  ...old.approvalHistory,
                ],
              }
            : old,
      )

      return { previous }
    },
    onSuccess: () => {
      toast({ description: 'Request approved' })
    },
    onError: (_error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(requestKeys.detail(input.requestId), context.previous)
      }
      toast({ description: 'Failed to approve request', variant: 'destructive' })
    },
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(input.requestId) })
      queryClient.invalidateQueries({ queryKey: requestKeys.list({}) })
    },
  })
}
```

### 2.3 Infinite Queries (Comments)

```typescript
// features/comments/hooks/query/useRequestCommentsQuery.ts
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { commentKeys } from '@/features/comments/queries/keys'
import { listRequestCommentsAction } from '@/external/handler/comment/query.action'

const PAGE_SIZE = 20

export const useRequestCommentsQuery = (requestId: string) =>
  useInfiniteQuery({
    queryKey: commentKeys.list(requestId),
    queryFn: ({ pageParam = 0 }) =>
      listRequestCommentsAction({ requestId, limit: PAGE_SIZE + 1, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.items.length > PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
    staleTime: 60 * 1000,
  })
```

### 2.4 Prefetch on Hover

```typescript
// features/requests/hooks/query/usePrefetchRequest.ts
'use client'

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { getRequestAction } from '@/external/handler/request/query.action'

export const usePrefetchRequest = () => {
  const queryClient = useQueryClient()

  const prefetch = useCallback((requestId: string) => {
    queryClient.prefetchQuery({
      queryKey: requestKeys.detail(requestId),
      queryFn: () => getRequestAction({ requestId }),
      staleTime: 10 * 60 * 1000,
    })
  }, [queryClient])

  return { prefetch }
}
```

---

## 3. Error Handling Patterns

- Use domain-specific errors (e.g., `BusinessError`) to distinguish missing resources from permission issues.
- For client hooks, centralise error handling in shared utilities (`shared/hooks/useErrorHandler`).
- Server components should translate errors into `notFound()` or `redirect()` where appropriate; all other errors bubble to `error.tsx`.

Example:

```typescript
// shared/hooks/useErrorHandler.ts
'use client'

import { useRouter } from 'next/navigation'
import { toast } from '@/shared/components/ui/use-toast'
import { BusinessError } from '@/external/service/errors'

export const useErrorHandler = () => {
  const router = useRouter()

  return (error: unknown) => {
    if (error instanceof BusinessError) {
      if (error.code === 'UNAUTHENTICATED') {
        toast({ description: 'Please sign in again', variant: 'destructive' })
        router.push('/login')
        return
      }
      toast({ description: error.message, variant: 'destructive' })
      return
    }
    toast({ description: 'Unexpected error occurred', variant: 'destructive' })
    console.error(error)
  }
}
```

---

## 4. Cache Strategy Guidelines

| Data Type | Suggested `staleTime` | Notes |
|-----------|-----------------------|-------|
| Request lists (filters applied) | 5 minutes | Invalidate on create/update |
| Request detail | 1 minute | Mutations should optimistically update |
| Approval queue | 30 seconds | Frequent polling allowed |
| Notifications | 30 seconds | Poll in background |
| Static metadata (e.g., request types) | 24 hours | Can be co-located in `shared/constants` |

Prefer `invalidateQueries` over `removeQueries` to keep cache warm. Use selectors (`setQueriesData`) for partial updates where possible.

---

## 5. Performance Tips

1. **Selective Prefetch**: Only fetch what is needed for the first paint. Delay heavy sections until user scroll/interacts.
2. **Parallel `Promise.all`**: Fetch independent resources concurrently (see dashboard example).
3. **Infinite Query Page Size**: Fetch `n + 1` items to determine `hasNextPage` without additional API calls.
4. **Hydration Filtering**: Use `dehydrate(queryClient, { shouldDehydrateQuery: ... })` to hydrate only critical data.

---

## 6. Implementation Checklist

When adding a new data flow:

1. Define query keys under the feature (`features/[feature]/queries/keys.ts`).  
2. Implement server-only functions in `external/handler/[feature]/query.server.ts`.  
3. Expose server actions (`query.action.ts` / `command.action.ts`).  
4. Create Server Component PageTemplate that prefetches data and wraps client containers in `HydrationBoundary`.  
5. Implement client hooks (`hooks/query`, `hooks/mutation`) that call server actions.  
6. Use Container/Presenter pattern for client components and wire hooks to presenters.  
7. Decide on optimistic updates vs. invalidation for mutations.  
8. Update layout wrappers if shared data is required (sidebar notifications, counters).  
9. Add tests with mocked query clients and server actions.  
10. Document any non-standard behaviour in feature README or docs.

---

By keeping server and client fetching in sync with TanStack Query, the Request & Approval System delivers fast initial renders, predictable caching, and responsive interactions while maintaining a clean separation between server-only logic and client UI.
