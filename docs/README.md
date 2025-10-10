# Documentation Index

This repository demonstrates best practices for building a maintainable, scalable Next.js App Router application. It serves as the reference implementation for an upcoming dev.to article.

## Project Goals

- Showcase production-ready architectural patterns with the App Router
- Provide maintainable frontend design practices emphasising separation of concerns
- Highlight a practical stack for real-world teams

## Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TanStack Query** for data fetching and caching
- **React Hook Form + Zod** for forms and validation
- **Shadcn UI** component library

### Back end / Data layer
- **PostgreSQL**
- **Drizzle ORM**
- **Server Components & Server Actions** for server-side execution

### Tooling
- **Docker Compose** for Postgres
- **pnpm** package manager

## Architectural Highlights

1. **External layer isolation** – server-only code for DB connections, Identity Platform, and third-party APIs lives under `frontend/src/external`.
2. **Type safety end-to-end** – DTOs + Zod schemas ensure runtime and compile-time safety.
3. **Cache-aware design** – TanStack Query powers optimistic updates and background refreshes.
4. **Robust forms** – React Hook Form + Zod provide performant, type-safe form workflows.
5. **Composable UI** – Container/Presenter pattern keeps components reusable and predictable.

## Documents

### System documentation
- [01 System Overview](./01-system-overview.md)
- [02 Requirements](./02-requirements.md)
- [03 Architecture](./03-architecture.md)
- [04 Data Model](./04-data-model.md)
- [05 API Contracts](./05-api-contracts.md)
- [06 Workflows](./06-workflows.md)
- [07 Non-Functional](./07-nonfunctional.md)
- [08 Environment & Local Setup](./08-env-and-local.md)

### Frontend documentation
See [frontend/docs](../frontend/docs/) for feature-level design and implementation guides.
