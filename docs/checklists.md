# Sustainable Next.js Checklists

Keep these near your editor when you add routes, ship data flows, or touch the architecture. Each item links back to the main guide in [`docs/README.md`](./README.md).

---

## 1. Adding or Updating a Route

- [ ] Decide the route group (`(guest)`, `(authenticated)`, `(neutral)`) and create `layout.tsx` alongside the new `page.tsx`.
- [ ] Use `LayoutProps<'/path'>` and export `metadata` from the layout; pages stay metadata-free.
- [ ] In `page.tsx`, await `props.params` / `props.searchParams` via `PageProps<'/path'>`.
- [ ] Delegate rendering to a feature template (e.g. `RequestsPageTemplate`) and keep business logic out of `app/`.
- [ ] Add loading/error boundaries if the route performs non-trivial work.
- [ ] Run `pnpm typegen` so typed routes stay in sync.

---

## 2. Fetching Data or Writing a Mutation

- [ ] Fetch in a Server Component first; hydrate TanStack Query only if the client needs ongoing interactivity.
- [ ] Validate server responses with helpers like `ensureRequestListResponse`; throw to surface errors in `error.tsx`.
- [ ] Expose derived data via hooks under `features/**/hooks/{query|mutation}`.
- [ ] Mutations invalidate only the keys impacted by the change (`Promise.all` helps keep things parallel).
- [ ] For read-only dashboards, prefer direct `Promise.all` calls instead of hydrating unnecessary queries.

---

## 3. Quality & Architecture Gate

- [ ] Lint passes (`pnpm lint`); auto-fix import order and directive placement issues.
- [ ] Client components start with `'use client'`; server-only modules declare `import 'server-only'`.
- [ ] DTOs and handlers validate input with Zod before hitting services.
- [ ] New auth flows interact with cookies exclusively through `features/auth/servers/token.server.ts`.
- [ ] Security-critical features update the CSP or middleware when needed.
- [ ] Tests (unit or integration) cover new behaviour; fixtures live beside the feature.

Refer back to the corresponding sections in the main guide if any box is hard to tick.
