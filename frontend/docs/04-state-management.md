# TanStack Query Implementation Guide

This document explains how the Request & Approval System uses **TanStack Query** to manage server state inside a Next.js App Router project. The approach assumes that initial data fetching happens on the server (Server Components, Server Actions), while TanStack Query handles client-side caching, background updates, optimistic UI, and shared state between interactive components.

---

## Architectural Principles

1. **Server-first fetching**  
   - Fetch request data (lists, detail, approval history) in server components or server actions.  
   - Use TanStack Query on the client only when interactivity, caching, or optimistic updates are required.

2. **Hydration boundary**  
   - Prefetch on the server with the same query key used on the client.  
   - Wrap the client container with `<HydrationBoundary state={dehydrate(queryClient)}>` to avoid double fetches.

3. **Feature isolation**  
   - Each feature (`requests/`, `approvals/`, `comments/`, `notifications/`) owns its query keys, hooks, and mutations.  
   - Shared patterns (query client factory, optimistic update helpers) live under `src/shared`.

---

## Query Client

The query client factory lives at `src/shared/lib/query-client.ts`.

```typescript
import { QueryClient } from '@tanstack/react-query'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

let browserQueryClient: QueryClient | undefined

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    return createQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }
  return browserQueryClient
}
```

Use `getQueryClient()` inside server components (new instance per request) and client components (singleton).

---

## Query Keys

Define keys per feature under `features/[feature]/queries/keys.ts`.

```typescript
// features/requests/queries/keys.ts
export const requestKeys = {
  all: ['requests'] as const,
  list: (filters: RequestFilterInput) =>
    [...requestKeys.all, 'list', filters] as const,
  detail: (requestId: string) =>
    [...requestKeys.all, 'detail', requestId] as const,
  approvalHistory: (requestId: string) =>
    [...requestKeys.detail(requestId), 'history'] as const,
  comments: (requestId: string) =>
    [...requestKeys.detail(requestId), 'comments'] as const,
}
```

Benefits:
- Keeps keys type-safe.
- Enables hierarchical invalidation (`invalidateQueries({ queryKey: requestKeys.all })`).
- Makes it easy to search for all cache usage per feature.

---

## Server Actions & Query Separation

### External layer (server-only)

```typescript
// src/external/handler/request/query.server.ts
import 'server-only'
import { listRequestsServer } from '@/external/service/request'
import { getSessionServer } from '@/features/auth/servers/session.server'

export async function listRequestsQuery(input: RequestFilterInput) {
  const session = await getSessionServer()
  if (!session?.user) throw new Error('Unauthorized')

  return listRequestsServer({
    requesterId: session.user.id,
    ...input,
  })
}
```

### Server action wrapper

```typescript
// src/external/handler/request/query.action.ts
'use server'

import { listRequestsQuery } from './query.server'

export async function listRequestsAction(input: RequestFilterInput) {
  return listRequestsQuery(input)
}
```

### Client hook

```typescript
// features/requests/hooks/query/useRequestListQuery.ts
import { useQuery } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'

export const useRequestListQuery = (filters: RequestFilterInput) =>
  useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => listRequestsAction(filters),
  })
```

---

## Server Components with Prefetch

```typescript
// features/requests/components/server/RequestsPageTemplate/RequestsPageTemplate.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { requestKeys } from '@/features/requests/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'
import { RequestList } from '@/features/requests/components/client/RequestList'

type Props = {
  filters: RequestFilterInput
}

export async function RequestsPageTemplate({ filters }: Props) {
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

### Client container consuming prefetched data

```typescript
// features/requests/components/client/RequestList/RequestListContainer.tsx
'use client'

import { useRequestListQuery } from '@/features/requests/hooks/query/useRequestListQuery'
import { RequestListPresenter } from './RequestListPresenter'

export function RequestList({ filters }: { filters: RequestFilterInput }) {
  const { data, isFetching, error } = useRequestListQuery(filters)

  if (error) return <RequestListPresenter.Error error={error} />

  return (
    <RequestListPresenter
      requests={data?.items ?? []}
      total={data?.total ?? 0}
      isLoading={!data}
      isRefetching={isFetching && !!data}
    />
  )
}
```

---

## Mutations & Optimistic Updates

```typescript
// features/approvals/hooks/mutation/useApproveRequestMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { approveRequestAction } from '@/external/handler/request/command.action'

export const useApproveRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveRequestAction,
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: requestKeys.detail(input.requestId),
      })

      const previous = queryClient.getQueryData<ApprovalDetail>(
        requestKeys.detail(input.requestId),
      )

      queryClient.setQueryData(requestKeys.detail(input.requestId), (old) =>
        old
          ? {
              ...old,
              status: 'approved',
              approvalHistory: [
                {
                  actor: 'You',
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
    onError: (_err, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          requestKeys.detail(input.requestId),
          context.previous,
        )
      }
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(input.requestId),
      })
      queryClient.invalidateQueries({ queryKey: requestKeys.list({}) })
    },
  })
}
```

Use the mutation within a client container, then wire it to presenter components or forms.

---

## Cache Invalidation Cheat Sheet

| Use case | Invalidation |
|----------|--------------|
| Newly created request | `invalidateQueries({ queryKey: requestKeys.list(filters) })` |
| Update on detail view | `invalidateQueries({ queryKey: requestKeys.detail(requestId) })` |
| Comment added | Invalidate both `comments(requestId)` and detail key |
| Notification read | `invalidateQueries({ queryKey: notificationKeys.unread })` |

Avoid `queryClient.removeQueries` unless the data is no longer relevant.

---

## Loading & Error States

- Prefer presenter-level states: `isLoading` for first render, `isRefetching` for background refresh.  
- Provide skeletons for request list cells (rows), detail panels, and approval timeline.

```tsx
const { data, isLoading, isFetching, error } = useRequestDetailQuery(id)

if (error) return <RequestDetailError error={error} />
if (isLoading) return <RequestDetailSkeleton />

return (
  <RequestDetailPresenter
    request={data}
    showRefreshing={isFetching && !isLoading}
  />
)
```

---

## File Structure

```
src/
├── features/
│   ├── requests/
│   │   ├── components/
│   │   │   ├── server/
│   │   │   └── client/
│   │   ├── hooks/
│   │   │   ├── query/
│   │   │   └── mutation/
│   │   ├── queries/
│   │   │   └── keys.ts
│   │   └── schemas/
│   └── approvals/
│       └── hooks/mutation/
├── shared/
│   └── lib/query-client.ts
└── external/
    └── handler/
        ├── request/
        │   ├── query.server.ts
        │   ├── query.action.ts
        │   ├── command.server.ts
        │   └── command.action.ts
        └── comment/
```

---

## Testing Strategy

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestClient()}>
    {children}
  </QueryClientProvider>
)

it('fetches request list', async () => {
  const { result } = renderHook(
    () => useRequestListQuery({ status: 'submitted' }),
    { wrapper },
  )

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
})
```

- Mock server actions using `vi.mock('@/external/handler/request/query.action')`.  
- Use `queryClient.clear()` between tests to avoid leakage.

---

## Migration Checklist

1. Add query keys for the feature (`queries/keys.ts`).  
2. Implement server-only query functions and server actions.  
3. Create query hooks (`hooks/query`) and mutation hooks (`hooks/mutation`).  
4. Prefetch inside server templates with `HydrationBoundary`.  
5. Integrate hooks in client containers; keep presenters dumb.  
6. Define invalidation strategy before coding mutations.

---

## Future Enhancements

- Introduce `notificationsKeys` for real-time approval notifications.  
- Adopt `useSuspenseQuery` when Suspense for React Query stabilises in Next.js App Router.  
- Add a shared optimistic update helper (`shared/lib/react-query.ts`) to consolidate patterns.  
- Explore streaming responses (e.g., audit feed) by manually pushing to `setQueryData`.

TanStack Query gives us a predictable, testable surface for the approval workflow. Keep server-side fetching as the default, then bring data into the client cache only when interactivity demands it.
