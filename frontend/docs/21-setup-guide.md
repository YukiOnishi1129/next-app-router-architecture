# Setup Guide

Follow this guide to configure the development environment, tooling, and workflows for the Request & Approval System.

---

## Prerequisites

- Node.js 18.17+
- pnpm 8+
- Docker & Docker Compose (for Postgres)
- Git

---

## Initial Setup

```bash
git clone <repository-url>
cd next-app-router-architecture
cp frontend/.env.example frontend/.env
# Update secrets / API keys in frontend/.env
```

Install dependencies and start Postgres:

```bash
cd frontend
pnpm install
docker compose up -d
pnpm db:push
pnpm dev
```

The app runs at http://localhost:3000.

---

## Workspace Settings (VS Code)

The repo includes workspace settings that enable:

- Auto save after 1s
- Prettier on save
- ESLint fixes on save
- Tailwind class name suggestions

Recommended extensions:

- Prettier – Code formatter
- ESLint
- Tailwind CSS IntelliSense
- GitLens (optional but helpful)

---

## Useful Scripts

```bash
pnpm dev             # Start Next.js dev server
pnpm lint            # Run ESLint
pnpm lint:fix        # ESLint with --fix
pnpm type-check      # TypeScript project check
pnpm test            # Vitest watch mode
pnpm test:run        # Single run (CI)
pnpm test:coverage   # Coverage report
pnpm db:push         # Sync schema (dev)
pnpm db:migrate      # Run migrations
pnpm db:studio       # Launch Drizzle Studio
```

---

## Branch Workflow

1. Create a feature branch: `git checkout -b feat/<name>`
2. Implement UI components (Presenter first, Container second).
3. Write tests (`pnpm test:run`).
4. Run linting (`pnpm lint`) and type check (`pnpm type-check`).
5. Commit and open a pull request.

---

## Database Schema Changes

1. Update Drizzle schema files under `external/client/db/schema`.
2. Generate migration (if needed):

```bash
pnpm db:generate
pnpm db:migrate
```

3. Apply migrations in other environments via CI/CD.

---

## Troubleshooting

- **Port conflicts**: adjust `DB_PORT` in `.env` if another Postgres instance is running.
- **Database connection errors**:
  ```bash
  docker ps
  docker compose logs db
  docker compose exec db pg_isready
  ```
- **Dependency issues**:
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm store prune
  pnpm install
  ```
- **TypeScript cache**:
  ```bash
  rm -rf .next
  pnpm type-check
  pnpm dev
  ```

---

## Next Steps

1. [Directory Structure](./01-directory-structure.md)
2. [Tech Stack](./02-tech-stack.md)
3. [Architecture Deep Dive](./20-architecture-deep-dive.md)
