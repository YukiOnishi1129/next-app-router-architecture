# next-app-router-architecture

Practical architecture patterns for building real-world apps with Next.js (App Router).

## Repository layout
- `frontend/` — Next.js (App Router). Run locally with `pnpm dev`.
- `docs/` — Specifications, requirements, and architecture docs.
- `compose.yml` — Local Postgres only.
- `.env` — Environment variables (see `.env.example`).

## App theme
**Request & Approval System** 
- Covers: Auth, CRUD, list/detail, filters, forms, RBAC, audit log, notifications.
- Roles: requester / approver / admin.