# Architecture Deep Dive

This document expands on the overall architecture of the Request & Approval System, focusing on the responsibilities of each layer and how data flows through the app.

---

## Directory Policy

```
frontend/src/
├── app/         # Routing & composition (page/layout/loading/error, thin actions)
├── features/    # Domain-specific UI, hooks, schemas, actions
├── shared/      # Cross-cutting UI, lib, providers
└── external/    # Server-only adapters, repositories, services, clients
```

### Responsibilities

- **app** – Route wiring, layouts, metadata. Keep business logic out.
- **features** – UI + logic scoped to a domain (Requests, Settings, Auth). Client/server components, hooks, schemas.
- **shared** – Generic, reusable components and utilities. No domain knowledge.
- **external** – Infrastructure code (DB, Identity Platform, HTTP clients). Only executed on the server.

---

## Data Flow

```
UI (app) → feature actions/hooks → external handlers → services → repositories → DB/API
```

### Example

1. **User action**: Click “Submit request” on `/requests/new`.
2. **Feature layer**: `createRequestAction` parses input with Zod and calls `createRequestCommandServer`.
3. **External layer**: `createRequestCommandServer` invokes `RequestWorkflowService`, which validates the aggregate and persists via `RequestRepository`.
4. **Result**: Service returns a DTO, action revalidates relevant pages or queries.

---

## Server vs Client

### Server Components

- Fetch data, enforce auth, perform heavy operations.
- Defined as `async` and can access the database directly.

### Client Components

- Interactivity, state, browser APIs.
- Declared with `'use client'` at top of file.

### Placement rules

- Each feature owns `components/server` (page templates) and `components/client` (containers/presenters).
- Hooks (`features/**/hooks`) orchestrate TanStack Query, mutations, business workflows.
- `features/**/servers` contains utilities like `requireAuthServer`, which must declare `import 'server-only'`.

---

## Server Actions Strategy

Two common patterns:

1. **`app` wrapper** – `app/(authenticated)/requests/actions.ts` exports thin wrappers that call feature actions. Useful when you want route-local actions.
2. **Feature-local** – actions live under `features/**/actions`. Preferred when the logic is tightly coupled to a feature.

Pick one per feature and stay consistent to reduce confusion.

---

## Security Boundaries

- All privileged operations run on the server.
- Client-side validation improves UX but never replaces server validation.
- `refreshIdTokenServer` handles token refresh, ensuring the client never touches refresh tokens.
- Audit logging occurs in services (`AuditService`), not in UI code.

---

## Principles

1. **Single Responsibility** – each module does one thing.
2. **Dependency Inversion** – higher layers depend on abstractions (repositories/services), not concrete DB clients.
3. **Interface Segregation** – expose narrow DTOs rather than leaking database models.
4. **Open/Closed** – extend behaviour via new services/handlers without rewriting existing code.

---

## Compliance Checklist

- [ ] Server-only modules declare `import 'server-only'`.
- [ ] Zod schemas exist for every command/query DTO.
- [ ] Feature containers stay declarative; presenters render HTML only.
- [ ] Server Actions parse inputs before invoking services.
- [ ] Refresh tokens handled exclusively on the server.
