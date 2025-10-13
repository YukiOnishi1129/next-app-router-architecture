# Frontend Architecture Quick Guide

This folder captures the minimum you need to understand when extending the App Router implementation. For the full narrative, start with [`docs/README.md`](../../docs/README.md); the notes below zoom in on day-to-day frontend work.

---

## 1. Layering Recap

```
frontend/src/
├── app/           # Route groups, layouts, `PageProps`
├── features/      # Domain slices (UI, hooks, actions, tests)
├── shared/        # Layout chrome, UI primitives, providers
└── external/      # Server adapters (handlers, services, DTOs)
```

- `app/` stays thin: every `page.tsx` delegates to a server template under `features/**/components/server`.
- `features/` enforce Container ↔ Presenter ↔ Hook separation. Client components sit under `components/client/**`, server components under `components/server/**`.
- `external/` hosts server-only integrations and declares `import 'server-only'` at the top of each module.

---

## 2. Route & Layout Pattern

```tsx
// app/(authenticated)/requests/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request List | Request & Approval System',
  description: 'Browse, filter, and search submitted requests.',
}

export default function RequestsLayout(props: LayoutProps<'/requests'>) {
  return <div className="px-6 py-8">{props.children}</div>
}
```

```tsx
// app/(authenticated)/requests/[requestId]/page.tsx
import { RequestDetailPageTemplate } from '@/features/requests/components/server/RequestDetailPageTemplate'

export default async function RequestDetailPage(
  props: PageProps<'/requests/[requestId]'>,
) {
  const { requestId } = await props.params
  const searchParams = await props.searchParams
  const highlight = Array.isArray(searchParams.highlight)
    ? searchParams.highlight[0]
    : searchParams.highlight

  return (
    <RequestDetailPageTemplate
      requestId={requestId}
      highlightCommentId={highlight}
    />
  )
}
```

Key rules:
- Every route exports `metadata` from its layout and never from the page.
- `PageProps` / `LayoutProps` keep params typed; always `await` them (Next.js 15+ makes them Promises).
- Layout wrappers (`AuthenticatedLayoutWrapper`, `GuestLayoutWrapper`) enforce access control and render the chrome.

---

## 3. Server-first Data Fetching

```tsx
// features/requests/components/server/RequestsPageTemplate.tsx
const queryClient = getQueryClient()
await queryClient.prefetchQuery({
  queryKey: requestKeys.list(filters),
  queryFn: async () => {
    const fetcher = selectRequestListFetcher(filters, handlers)
    return ensureRequestListResponse(await fetcher())
  },
})

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <RequestList filters={filters} />
  </HydrationBoundary>
)
```

Guidelines:
- Fetch in Server Components first; hydrate TanStack Query so client components avoid loading flicker.
- Dashboards that read limited data (`DashboardPageTemplate`) can skip hydration and use direct `Promise.all`.
- Client hooks live under `features/**/hooks/{query|mutation}` and convert DTOs into presenter props.
- Mutations (e.g. `useApproveRequestMutation`) should invalidate the smallest possible set of query keys.

---

## 4. Forms & Validation

- Forms use React Hook Form + Zod (`features/**/components/client/*Form*`).  
- Schemas for submissions live under `features/**/types` or `external/dto/**`, depending on reuse.  
- Client containers call hooks (`useRequestForm`, `useProfileEmailForm`) that own TanStack Query + mutation logic; presenters are stateless.
- Server actions live in `features/**/actions/` and orchestrate validation + side-effects before delegating to `external/handler/**`.

---

## 5. Component Anatomy

### Client-side slices

```
features/<domain>/components/client/<Widget>/
├── <Widget>.tsx            # Barrel re-export (optional)
├── <Widget>Container.tsx   # Orchestrates hooks/mutations (always `'use client'`)
├── <Widget>Presenter.tsx   # Pure JSX; no side-effects
├── use<Widget>.ts          # Derived state + TanStack Query helpers
├── *.test.tsx/ts           # Co-located tests
├── *.stories.tsx           # Storybook stories (optional)
└── index.ts                # Local barrel re-export
```

Rules of thumb:
- Containers depend on hooks (`use<Widget>`) and pass flattened props to presenters.
- Presenters avoid business logic: props in, JSX out.
- Hooks handle TanStack Query, React Hook Form, derived state, and optimistic updates.
- Keep tests and stories next to the implementation for discoverability.

### Server components

```
features/<domain>/components/server/<Thing>/
├── <Thing>.tsx             # Server Component template
├── index.ts                # Barrel export
└── *.test.ts               # Optional server-focused tests
```

- Server templates compose data fetching, layout structure, and pass hydrated state to client containers.
- Use helpers in `features/**/queries/**` (`ensureRequestListResponse`, `selectRequestListFetcher`) to validate DTOs before reaching the client.

---

---

## 6. External Layer Snapshot

```
external/
├── dto/           # Zod schemas + TypeScript DTOs (shared across layers)
├── handler/
│   ├── <domain>/
│   │   ├── command.server.ts  # Mutating server actions
│   │   └── query.server.ts    # Read-only server actions
├── repository/   # Database persistence (Drizzle queries)
├── service/      # Domain services (aggregate + orchestration)
└── client/       # Third-party API clients (Identity Platform, etc.)
```

- Only handlers are imported by features; services/repositories never cross the boundary.
- Every server-only file starts with `import 'server-only'`.
- DTOs power validation from handler → feature → tests, keeping types consistent.

---

## 7. Quality Guardrails

- Custom ESLint rules (`eslint-local-rules/`) enforce boundaries:
  - `restrict-service-imports`: only handlers touch services.
  - `restrict-action-imports`: actions consumed by client components or hooks.
  - `use-nextjs-helpers`: requires `PageProps` / `LayoutProps`.
- Running `pnpm lint` and `pnpm test` before each push keeps the architecture intact.
- Unit tests live beside the code (`*.test.tsx` / `.test.ts`). They rely on Vitest + React Testing Library; prefer testing hooks/containers where behaviour lives.

---

## 8. Quick Links

| Topic | Path |
|-------|------|
| Authenticated layout wrapper | `frontend/src/shared/components/layout/server/AuthenticatedLayoutWrapper.tsx` |
| Requests feature slice | `frontend/src/features/requests` |
| Notifications feature slice | `frontend/src/features/notifications` |
| ESLint architecture rules | `frontend/eslint-local-rules` |
| TanStack Query helpers | `frontend/src/shared/lib/query-client.ts`, `frontend/src/features/**/queries` |
| External layer layout | `frontend/src/external/{dto,handler,service,repository}` |

Stay aligned with these notes and the system-level guide, and you’ll keep the App Router implementation sustainable even as the feature set grows.
