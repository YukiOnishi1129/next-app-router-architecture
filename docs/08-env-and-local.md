# Environment & Local Setup

## Prerequisites

- Node.js ≥ 18.17
- pnpm ≥ 8
- Docker & Docker Compose
- Git

## Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd next-app-router-architecture
```

2. **Provision environment variables**
```bash
cp frontend/.env.example frontend/.env
# Update values as needed for your environment
```

3. **Start PostgreSQL**
```bash
docker compose up -d
docker compose ps
```

4. **Install dependencies**
```bash
cd frontend
pnpm install
```

5. **Apply database schema**
```bash
pnpm db:push         # Development sync
# or
pnpm db:migrate      # Run generated migrations
```

6. **Start the dev server**
```bash
pnpm dev
```

The app runs at http://localhost:3000.

## Docker Compose

`compose.yml` provisions a Postgres 15 container. Useful commands:
```bash
docker compose up -d          # start database
docker compose down           # stop database
docker compose logs -f db     # tail logs
docker compose exec db psql -U $DB_USER -d $DB_NAME
docker compose down -v && docker compose up -d   # reset database
```

## Environment Variables

`frontend/.env.example` documents the required values:

```bash
# Database
DB_CONTAINER_NAME=next-app-router-architecture-db
DB_USER=user
DB_PASSWORD=password
DB_NAME=NEXT_APP_ROUTER_ARCHITECTURE
DB_PORT=5432
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# NextAuth / Identity Platform
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GCP_IDENTITY_PLATFORM_API_KEY=your-gcp-api-key
GCP_PROJECT_ID=your-gcp-project-id
```

Optional providers (email, uploads, etc.) can be appended per environment.

## VS Code

The repo ships with workspace settings:
- Auto save after 1s
- Prettier on save
- ESLint auto-fix
- Tailwind class name IntelliSense

Recommended extensions:
- Prettier ‒ Code formatter
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Language Features (built-in)

## Common Scripts

```bash
pnpm dev             # start Next.js dev server
pnpm lint            # run ESLint
pnpm lint:fix        # ESLint with auto-fix
pnpm type-check      # TypeScript project check
pnpm test            # Vitest (watch)
pnpm test:run        # Vitest CI run
pnpm test:coverage   # coverage report
pnpm build           # production build
pnpm start           # start Next.js in production mode
```

## Troubleshooting

### Database connection issues
```bash
docker ps                              # verify container is running
docker compose logs db                 # inspect logs
docker compose exec db pg_isready      # readiness probe
```

### Port conflicts
If another Postgres instance is already running, change `DB_PORT` in `.env` and restart Docker Compose.

### Permission issues
```bash
sudo chown -R "$(whoami)" node_modules
pnpm store prune
```

### TypeScript cache
```bash
pnpm type-check
rm -rf .next
pnpm dev
```

## Deployment

### Vercel
1. Create a project in Vercel.
2. Configure environment variables (DATABASE_URL, NEXTAUTH credentials, etc.).
3. Build command: `pnpm build`
4. Output directory: `.next`

### Docker example
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```
