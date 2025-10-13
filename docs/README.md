# Sustainable Next.js App Router Architecture

This repository is the living reference for the dev.to series on building **sustainable, production-ready systems with the Next.js App Router**. It distils the design decisions, guardrails, and quality practices we rely on to ship fast without sacrificing maintainability.

Use this document as the single entry point: every section links back to real code so you can jump from narrative to implementation instantly. A compact set of checklists lives in [`docs/checklists.md`](./checklists.md).

---

## 1. Product Overview

| Capability | Description | Code breadcrumbs |
|------------|-------------|------------------|
| Request authoring | Authenticated users draft requests, attach metadata, and submit for approval. Drafts auto-save and can be edited before submission. | `frontend/src/features/requests/components/server/RequestsPageTemplate`, `.../RequestEditPageTemplate` |
| Approval workflow | Reviewers see pending items, take decisions, and leave comments. Decision history is immutable and audit-ready. | `frontend/src/features/approvals` |
| Notifications | Users receive in-app notifications for assignments, decisions, and email-change steps; unread counts surface in the layout chrome. | `frontend/src/features/notifications` |
| Authentication & profile | Email/password auth with request-to-change-email flow, password reset, and profile updates guarded behind auth layouts. | `frontend/src/features/auth`, `frontend/src/features/settings` |
| Settings & auditability | Profile sections (name/email/password) and change logs rely on DTO validation + audit-friendly server actions. | `frontend/src/features/settings`, `frontend/src/external/dto` |

High-level flow:
1. **Requester** drafts a request → submits → system notifies assigned reviewer.
2. **Reviewer** opens pending approvals → approves or rejects → requester receives notification and history updates.
3. **Both roles** manage credentials via the auth flows (signup, login, email change, password reset).

Non-goals for this example: it omits billing, complex role hierarchies, and real-time collaboration. The focus is on patterns you can adapt to larger systems.

---

## 2. Guiding Principles

1. **Layer with intent** – keep the App Router thin, push business logic into feature modules, and isolate infrastructure concerns under `external/`.
2. **Prefer server-first rendering** – fetch in Server Components, hydrate TanStack Query only when the client needs to stay interactive.
3. **Guard navigation via layouts** – route groups provide clean URLs, while layout wrappers enforce auth and render shared chrome.
4. **Codify quality gates** – lint rules, tests, and DTO validation exist to stop regressions before they reach users.

If a decision conflicts with these principles, we revisit the design before merging.

---

## 3. Directory & Layering

```
frontend/src/
├── app/           # Routes, layouts, metadata (no business logic)
├── features/      # Domain bundles (UI, hooks, actions, schemas, tests)
├── shared/        # Cross-cutting UI primitives, layout chrome, providers
└── external/      # Server adapters: handlers, services, repositories, DTOs
```

- `app/` ties URLs to feature templates and applies route-group layouts.  
- `features/` own orchestration: Container/Presenter components, hooks, TanStack Query logic, React Hook Form schemas.  
- `shared/` hosts reusable pieces with zero domain knowledge (shadcn UI, layout shell, query provider).  
- `external/` is the only place infrastructure code lives; all server modules declare `import 'server-only'`.

➜ See `frontend/src/app/(authenticated)/requests` for a complete slice covering route wiring → server template → client list.

---

## 4. Routing & Layout Playbook

- Route groups (`(guest)`, `(authenticated)`, `(neutral)`) keep URLs clean while enabling tailored guards.  
- Layout wrappers enforce access and render shared UI:

  ```tsx
  // frontend/src/app/(authenticated)/layout.tsx
  import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

  export const dynamic = 'force-dynamic'

  export default function AuthenticatedLayout(props: LayoutProps<'/'>) {
    return <AuthenticatedLayoutWrapper>{props.children}</AuthenticatedLayoutWrapper>
  }
  ```

- Pages use the global helpers for typed params and search values:

  ```tsx
  // frontend/src/app/(authenticated)/requests/[requestId]/page.tsx
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

- Nested layouts add section chrome (tabs, breadcrumbs) while inheriting guards from their parents.

---

## 5. Data Fetching & Server Actions

**Server-first render**

```tsx
// frontend/src/features/requests/components/server/RequestsPageTemplate.tsx
const queryClient = getQueryClient()
await queryClient.prefetchQuery({
  queryKey: requestKeys.list(filters),
  queryFn: async () => {
    const fetcher = selectRequestListFetcher(filters, { ...handlers })
    return ensureRequestListResponse(await fetcher())
  },
})

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <RequestList filters={filters} />
  </HydrationBoundary>
)
```

- Server Components (page templates, wrappers) do the first fetch.  
- TanStack Query hydrates so client components can stay interactive without a flash of loading.  
- Dashboard-like screens that read small datasets inline (`DashboardPageTemplate`) can skip TanStack Query entirely.

**Client hooks & mutations**

- `useRequestListQuery` chooses the correct server action, validates the payload, and returns presenter-friendly props.  
- Mutations like `useApproveRequestMutation` invalidate only the keys impacted by the change (`approvals`, `requests.detail`, `requests.history`, `notifications`).  
- Keep hooks under `features/**/hooks/{query|mutation}` and let containers translate them into UI props.

---

## 6. Quality Gates

### Lint & conventions
- `eslint-local-rules/` enforces architectural boundaries (`restrict-service-imports`, `restrict-action-imports`, `use-nextjs-helpers`, etc.).  
- Import sorting keeps modules consistent: core → external → features → shared → external → relative → styles.  
- Run `pnpm lint` (or `pnpm lint:fix`) before every commit.

### Validation & security
- DTOs with Zod live under `external/dto/**`; every handler validates inputs before touching services.  
- `features/auth/servers/token.server.ts` manages `id-token` and `refresh-token` cookies; refresh logic never leaks to the client.  
- Enforce CSP in `frontend/src/app/layout.tsx` and guard routes via layout wrappers instead of heavy middleware.

### Tests
- Hooks and presenters live beside their implementation with Vitest + React Testing Library.  
- End-to-end flows rely on meaningful fixtures and the same DTOs, providing confidence that the external layer stays honest.

See [`docs/checklists.md`](./checklists.md) for quick “before you merge” reminders.

---

## 7. Local Setup (2 minutes)

```bash
pnpm install
pnpm db:up        # start Postgres via Docker
pnpm db:migrate   # apply schema
pnpm dev          # launch Next.js (http://localhost:3000)
```

Key env vars live in `.env.example`. Regenerate route typings with `pnpm typegen` whenever you add or remove a `page.tsx`.

---

## 8. Where to Look in the Codebase

| Question | Jump to |
|----------|---------|
| How do we enforce auth and layout chrome? | `frontend/src/shared/components/layout/server/AuthenticatedLayoutWrapper.tsx` |
| How does a route wire into a feature? | `frontend/src/app/(authenticated)/requests/[requestId]/page.tsx` |
| What does a complete feature slice look like? | `frontend/src/features/requests` |
| How are server actions structured? | `frontend/src/features/**/actions/` |
| Where do DTOs and external calls live? | `frontend/src/external` |
| Need a refresher on client/server component anatomy? | [`frontend/docs/README.md`](../frontend/docs/README.md) |

Use this map when writing about—or extending—the architecture. If you need a condensed reference while coding, open [`docs/checklists.md`](./checklists.md).
