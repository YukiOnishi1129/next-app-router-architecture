# Routing & Layouts (App Router)

This guide describes how the Request & Approval System organises routes, layouts, and type-safe navigation using the Next.js App Router (Next.js 15.5). It consolidates routing basics, route groups, wrappers, and TypeScript helpers into a single reference.

---

## 1. Route Hierarchy Overview

```
src/app/
├── layout.tsx                     # Root providers (QueryClient, Theme, etc.)
├── (guest)/                       # Public routes (login, signup)
│   ├── layout.tsx                 # Guest layout wrapper
│   └── login/
│       └── page.tsx
├── (authenticated)/               # Authenticated area
│   ├── layout.tsx                 # Requires authentication, dashboard shell
│   ├── requests/
│   │   ├── page.tsx               # List with filters
│   │   ├── new/
│   │   │   └── page.tsx           # Request creation form
│   │   └── [requestId]/
│   │       ├── page.tsx           # Request detail
│   │       └── comments/
│   │           └── page.tsx       # Comments tab (optional)
│   ├── approvals/
│   │   └── page.tsx               # Pending approvals
│   ├── dashboard/
│   │   └── page.tsx               # Overview cards
│   └── settings/
│       └── profile/
│           └── page.tsx
└── (neutral)/                     # Terms, help, password reset
    ├── layout.tsx
    ├── terms/
    │   └── page.tsx
    └── password-reset/
        └── page.tsx
```

Key ideas:
- Route groups (`(guest)`, `(authenticated)`, `(neutral)`) keep URL paths clean while allowing dedicated layouts and guards.
- Business pages live under `features/`, while `app/` only wires routes to feature templates and layout wrappers.

---

## 2. File Conventions Recap

| File | Purpose | Notes |
|------|---------|-------|
| `page.tsx` | Route entry point (Server Component by default) | Use `PageProps` for typed params/searchParams |
| `layout.tsx` | Nested layout (Server Component) | Inherit providers/structure |
| `loading.tsx` | Streaming fallback | Server Component |
| `error.tsx` | Error boundary | Must be Client Component (`'use client'`) |
| `not-found.tsx` | 404 handling | Optional |
| `template.tsx` | Force remount of layout subtree | Optional |

> **Important**: In Next.js 15.5+, both `props.params` and `props.searchParams` are **Promises**. You must `await` them inside `page.tsx` / `layout.tsx`.

---

## 3. Route Groups & Layout Wrappers

### Guest Area `(guest)`

```tsx
// app/(guest)/layout.tsx
import type { LayoutProps } from 'next'
import { GuestLayoutWrapper } from '@/shared/components/layout/server/GuestLayoutWrapper'

export default async function GuestLayout(props: LayoutProps<'/(guest)'>) {
  return <GuestLayoutWrapper>{props.children}</GuestLayoutWrapper>
}
```

`GuestLayoutWrapper` should:
- Redirect authenticated users via `redirect('/requests')`
- Provide a centred card layout for forms
- Optionally prefetch public data (e.g., marketing copy)

### Authenticated Area `(authenticated)`

```tsx
// app/(authenticated)/layout.tsx
import type { LayoutProps } from 'next'
import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

export default async function AuthenticatedLayout(
  props: LayoutProps<'/(authenticated)'>,
) {
  return <AuthenticatedLayoutWrapper>{props.children}</AuthenticatedLayoutWrapper>
}
```

`AuthenticatedLayoutWrapper` responsibilities:
- Run `requireAuthServer()` (TODO) to enforce sessions
- Prefetch sidebar counts (pending approvals, drafts) via TanStack Query
- Render shared chrome (sidebar, header, notifications)

### Neutral Area `(neutral)`

Used for routes accessible by both guests and authenticated users (terms, password reset).

---

## 4. Page Components with `PageProps`

Example: request detail page under `(authenticated)/requests/[requestId]`.

```tsx
// app/(authenticated)/requests/[requestId]/page.tsx
import type { PageProps } from 'next'
import { RequestDetailPageTemplate } from '@/features/requests/components/server/RequestDetailPageTemplate'

export default async function RequestDetailPage(
  props: PageProps<'/(authenticated)/requests/[requestId]'>,
) {
  const { requestId } = await props.params
  const { highlight } = await props.searchParams // optional highlight comment

  return (
    <RequestDetailPageTemplate
      requestId={requestId}
      highlightCommentId={highlight}
    />
  )
}
```

Benefits:
- Full IntelliSense for `requestId` and `highlight`
- Eliminates manual type definitions
- Async-friendly with `await props.params`

---

## 5. Layout Components with `LayoutProps`

```tsx
// app/(authenticated)/requests/layout.tsx
import type { LayoutProps } from 'next'
import { RequestsSectionLayout } from '@/features/requests/components/server/RequestsSectionLayout'

export default async function RequestsLayout(
  props: LayoutProps<'/(authenticated)/requests'>,
) {
  return <RequestsSectionLayout>{props.children}</RequestsSectionLayout>
}
```

Nested layouts allow for context-specific navigation (tabs, breadcrumbs) while inheriting authentication checks from the parent `(authenticated)` layout.

---

## 6. Loading & Error Boundaries

```tsx
// app/(authenticated)/requests/loading.tsx
import { RequestListSkeleton } from '@/features/requests/components/client/RequestList/RequestListSkeleton'

export default function RequestsLoading() {
  return <RequestListSkeleton />
}
```

```tsx
// app/(authenticated)/requests/error.tsx
'use client'
import { ErrorState } from '@/shared/components/feedback/ErrorState'

export default function RequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      title="Unable to load requests"
      description={error.message}
      onRetry={reset}
    />
  )
}
```

---

## 7. Type-safe Navigation (typedRoutes)

Enable in `next.config.ts`:

```typescript
const config: NextConfig = {
  typedRoutes: true,
}
export default config
```

Regenerate route types whenever you add/remove `page.tsx`:

```bash
pnpm typegen
```

Type-safe usage:

```tsx
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/requests') // typed string literal
router.push({ pathname: '/requests/[requestId]', params: { requestId } })
```

---

## 8. API Route Typing with `RouteContext`

```tsx
// app/api/requests/[requestId]/route.ts
import type { RouteContext } from 'next'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  context: RouteContext<'/api/requests/[requestId]'>,
) {
  const { requestId } = await context.params
  const request = await getRequestServer({ requestId })
  return NextResponse.json(request)
}
```

---

## 9. Best Practices for Our Domain

1. **Keep business logic out of `app/`**  
   Server components should delegate to feature templates (`features/requests/components/server/...`).

2. **Use layouts for shared data fetching**  
   Prefetch frequently-used data (notifications, profile) in `(authenticated)/layout.tsx` to avoid duplicate requests.

3. **Define route guards centrally**  
   Implement `requireAuthServer` and `redirectIfAuthenticatedServer` in `features/auth/servers/redirect.server.ts` and use them in route group layouts.

4. **Avoid deep nesting**  
   Two levels of route groups are usually sufficient: top-level `(guest)`, `(authenticated)`, `(neutral)` and optional feature-specific groups (e.g., `(requests)` for tabbed sections).

5. **Use `generateStaticParams` sparingly**  
   Requests/approvals are user-specific; rely on dynamic rendering instead of static generation.

---

## 10. Checklist When Adding a Route

1. Decide which route group it belongs to (`(guest)`, `(authenticated)`, `(neutral)` or nested).  
2. Create `page.tsx` under the appropriate directory.  
3. If the route needs a dedicated layout (tabs/sidebar), add `layout.tsx` next to it.  
4. Use `PageProps` / `LayoutProps` for type-safe params.  
5. Wire the page to a `PageTemplate` Server Component inside `features/.../components/server`.  
6. Prefetch data with `HydrationBoundary` where relevant.  
7. Add loading/error states for slow or failure cases.  
8. Run `pnpm typegen` to update route typings.  
9. Update navigation/menus in `AuthenticatedLayoutWrapper` if needed.

---

By combining route groups, reusable layout wrappers, and the new route typing helpers, we keep the routing layer thin, secure, and maintainable while giving each feature the structure it needs to evolve independently.
