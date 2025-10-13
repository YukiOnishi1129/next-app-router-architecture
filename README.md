# next-app-router-architecture

Architecture patterns for building sustainable, production-ready apps with the Next.js App Router. The codebase implements a Request & Approval System that doubles as a reference for the accompanying dev.to series.

> Looking for the full story? Start with [`docs/README.md`](./docs/README.md). It covers the product, guiding principles, routing patterns, data fetching, and quality guardrails. Need the frontend-specific playbook? Jump to [`frontend/docs/README.md`](./frontend/docs/README.md).

---

## Quick Start

```bash
pnpm install
pnpm db:up        # start Postgres (Docker)
pnpm db:migrate   # apply schema
pnpm dev          # launch Next.js at http://localhost:3000
```

1. Copy `.env.example` to `.env` (root) and `.env.local` (inside `frontend/`).
2. Fill in auth/environment variables (see next section).
3. Start Postgres: `docker compose up -d db` (or `pnpm db:up`).
4. Run migrations + dev server (`pnpm db:migrate`, `pnpm dev`).

Regenerate typed routes whenever you add/remove a page with `pnpm typegen`.

---

## Environment Setup

### Root `.env`
Contains shared values (database URL, etc.). Example:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/next_app_router_architecture
```

### Frontend `.env.local`

Rename `frontend/.env.example` to `.env.local` and provide:

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate a strong secret: `openssl rand -base64 32`>

# Google Identity Platform
GCP_IDENTITY_PLATFORM_API_KEY=<API key>
GCP_PROJECT_ID=<Firebase/GCP project id>
```

> **Google Identity Platform configuration**
> - Enable Identity Platform (or Firebase Authentication) in your GCP project.
> - Add `http://localhost:3000` to the authorized domains.
> - Create a web API key and use it for `GCP_IDENTITY_PLATFORM_API_KEY`.

Restart `pnpm dev` after editing `.env.local`.

---

## Repository Map

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js App Router implementation (features, shared layer, external adapters). |
| `docs/` | System-level guide, checklists, and product context. |
| `compose.yml` | Local Postgres container. |
| `scripts/` | Utility scripts (migration helpers, etc.). |

Within `frontend/src/`:

```
app/         # Route groups, layouts, metadata
features/    # Domain slices (UI, hooks, actions, tests)
shared/      # Cross-cutting UI + providers
external/    # Server adapters (dto, handler, service, repository, client)
```

---

## App Theme at a Glance

- **Use case:** Request & Approval System for internal teams.
- **Roles:** requester, approver (reviewer), admin.
- **Capabilities:** authentication, request authoring & editing, approval workflow, notifications, profile management, audit-friendly actions.

Each feature slice demonstrates how to combine Server Components, Server Actions, TanStack Query, and React Hook Form in a maintainable way.

---

## Useful Links

- [System Guide (`docs/README.md`)](./docs/README.md) – product overview, architectural principles, routing/data-fetching patterns.
- [Frontend Guide (`frontend/docs/README.md`)](./frontend/docs/README.md) – client/server component anatomy, Container/Presenter/Hook structure, external layer layout.
- [Checklists (`docs/checklists.md`)](./docs/checklists.md) – quick “before you merge” reminders for routes, data flows, and quality gates.
