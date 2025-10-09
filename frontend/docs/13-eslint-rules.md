# ESLint Rules & Import Conventions

This guide documents the custom ESLint rules and import ordering conventions used to preserve the Request & Approval System architecture. These rules ensure server/client separation, enforce CQRS boundaries, and keep code consistent with Next.js 15.5 features.

---

## 1. Custom Rules Summary

| Rule | Purpose |
|------|---------|
| `restrict-service-imports` | Only allow `external/service` modules to be consumed by command/query handlers |
| `require-server-only` | Enforce `import 'server-only'` in server-only files |
| `restrict-action-imports` | Restrict `*.action.ts` imports to client components (`'use client'`) and hooks |
| `use-server-check` | Validate proper usage of `'use server'` directive |
| `use-client-check` | Validate proper usage of `'use client'` directive |
| `use-nextjs-helpers` | Require `PageProps` / `LayoutProps` in app router pages/layouts when props are used |

All rules live under `eslint-local-rules/` and are activated through the flat config.

---

## 2. `restrict-service-imports`

**Intent:** maintain the CQRS boundary. Services under `src/external/service/**` expose low-level integrations (Identity Platform, database repositories) and must only be imported by handler files (`*.command.ts` / `*.query.ts`).

**Allowed**

```typescript
// src/external/handler/request/command.server.ts
import 'server-only'
import { createRequestService } from '@/external/service/request/createRequest.service'
```

**Disallowed**

```typescript
// src/features/requests/hooks/useRequestListQuery.ts
import { listRequestsService } from '@/external/service/request/listRequests.service' // ❌
```

If a feature needs data, call the corresponding handler action (see `restrict-action-imports`).

---

## 3. `require-server-only`

The following locations must declare `import 'server-only'` at the top:

- `features/**/servers/*.ts`
- `shared/servers/*.ts`
- `external/handler/**/**.server.ts` (command/query)
- `external/service/**/**.ts`
- `external/streaming/*.ts`

This guarantees that server-only modules are never bundled for the browser.

Auto-fix is supported (`pnpm lint:fix`).

---

## 4. `restrict-action-imports`

Enforces that `*.action.ts` modules are only imported by:

1. Client components that start with `'use client'`
2. Hook files (`use*.ts`, `use*.tsx`)

Server components should call the server-only functions directly (e.g., `createRequestServer`) instead of importing actions. If a component fails linting, either:
- Add `'use client'` if it is intended to be interactive, or
- Wrap the action in a custom hook (`useCreateRequest`) and import that instead.

---

## 5. `use-server-check` and `use-client-check`

These helpers validate directive placement:

- `'use server'` must appear before any other statements in server action modules.
- `'use client'` must appear before imports in client components.

Violations usually signal copy/paste mistakes or misclassified files.

---

## 6. `use-nextjs-helpers`

Next.js 15.5 introduces `PageProps` and `LayoutProps` to type route params. This rule enforces their usage whenever `page.tsx` / `layout.tsx` components accept props. これらの型はグローバルに宣言されているため、`import` は不要です。

### Example (Correct)

```typescript
// app/(authenticated)/requests/[requestId]/page.tsx
export default async function RequestDetailPage(
  props: PageProps<'/(authenticated)/requests/[requestId]'>,
) {
  const { requestId } = await props.params
  const { highlight } = await props.searchParams

  return <RequestDetailPageTemplate requestId={requestId} highlightCommentId={highlight} />
}
```

The rule autogenerates route strings, removes group names, and supports auto-fix. Make sure `typedRoutes: true` is enabled and run `pnpm typegen` when routes change.

---

## 7. Import Sorting

`eslint-plugin-import` enforces a deterministic order:

1. Node/Next core modules
2. External packages
3. `@/features/**`
4. `@/shared/**`
5. `@/external/**`
6. Relative imports (`./`, `../`)
7. Type-only imports (after their corresponding section)
8. Style imports (last)

Example:

```typescript
import { redirect } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { approveRequestAction } from '@/external/handler/approval/command.action'

import { ApprovalTimeline } from './ApprovalTimeline'

import type { ApprovalDetail } from '@/features/approvals/types'

import './styles.css'
```

Imports are automatically sorted on save (VSCode ESLint integration) or via `pnpm lint:fix`.

---

## 8. Workflow & Troubleshooting

- Run `pnpm lint` before pushing; CI (GitHub Actions) will run the same rules.
- If auto-fix fails because ESLint isn’t installed in VSCode, check the **Output › ESLint** panel.
- For false positives, confirm the file resides in the expected path (e.g., command handlers must live under `external/handler/**`).  
  Adjustments can be made in `eslint-local-rules/` if architecture conventions change.

---

## 9. Architecture Reminder

```
UI (Client Components, Hooks)
        ↓
Server Actions (imported only where allowed)
        ↓
Handler Functions (server-only: *.command.ts / *.query.ts)
        ↓
Services (external integrations)
```

These rules encode the boundary so that accidental leaks (e.g., importing a service directly from a client component) are caught automatically.
