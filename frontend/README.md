# Frontend Overview

This directory hosts the Next.js App Router implementation of the Request & Approval System. It showcases sustainable patterns for combining Server Components, Server Actions, TanStack Query, and React Hook Form.

---

## Development

```bash
pnpm install
pnpm db:up        # Postgres (Docker)
pnpm db:migrate   # apply schema
pnpm dev          # http://localhost:3000
```

Regenerate typed routes whenever you add or remove a `page.tsx`:

```bash
pnpm typegen
```

Key commands:

| Command | Purpose |
|---------|---------|
| `pnpm lint` | Run ESLint with architecture rules (`eslint-local-rules/`). |
| `pnpm test` | Run Vitest unit tests (hooks, presenters, server templates). |
| `pnpm db:seed` | Seed sample data (optional). |

---

## Architecture Cliff Notes

- **Routes & layouts:** `src/app/(group)/...` stay thin—each page defers to a feature server template. Layouts export metadata and use `LayoutProps<'/path'>`.
- **Features:** `src/features/<domain>` contain client/server components, hooks, queries, actions, and tests following the Container ➜ Presenter ➜ Hook split.
- **Shared layer:** `src/shared` exposes layout chrome (Header, Sidebar), UI primitives (shadcn-based), and providers (TanStack Query, Auth).
- **External layer:** `src/external` contains DTOs, handlers, services, repositories, and third-party clients. Only handlers cross into features.
- **Custom ESLint rules:** `eslint-local-rules/` enforce boundaries (`restrict-service-imports`, `restrict-action-imports`, `use-nextjs-helpers`, etc.).

For a deeper dive—including component anatomy and data-fetching patterns—open [`frontend/docs/README.md`](./docs/README.md). System-level guidance lives in [`docs/README.md`](../docs/README.md).
