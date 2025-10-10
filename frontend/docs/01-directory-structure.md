# Directory Structure

```
src/
├── app/                                      # Next.js App Router
│   ├── layout.tsx                            # Root layout (Server Component)
│   ├── page.tsx                              # Root page
│   └── (authenticated)/                      # Authenticated route group
│       ├── layout.tsx                        # Auth shell
│       └── dashboard/
│           └── page.tsx                      # Dashboard entry
├── features/                                 # Domain-focused modules
│   ├── requests/
│   │   ├── actions/                          # Server Actions (command/query)
│   │   ├── components/
│   │   │   ├── client/                       # Client components (Container/Presenter)
│   │   │   │   └── RequestForm/
│   │   │   │       ├── RequestForm.tsx             # Container re-export
│   │   │   │       ├── RequestFormContainer.tsx    # Orchestrates hooks/state
│   │   │   │       ├── RequestFormPresenter.tsx    # Presentational component
│   │   │   │       ├── useRequestForm.ts           # Business logic hook
│   │   │   │       ├── RequestForm.test.tsx        # Container integration test
│   │   │   │       ├── useRequestForm.test.ts      # Hook unit test
│   │   │   │       ├── RequestForm.stories.tsx     # Storybook (container)
│   │   │   │       ├── RequestFormPresenter.stories.tsx # Storybook (presenter)
│   │   │   │       └── index.ts                        # Local barrel (exports container/presenter/hook)
│   │   │   └── server/                       # Server Components (page templates)
│   │   │       └── NewRequestPageTemplate/
│   │   │           ├── NewRequestPageTemplate.tsx
│   │   │           └── index.ts
│   │   ├── hooks/                            # Client hooks (TanStack Query wrappers)
│   │   ├── queries/                          # queryKeys and shared query helpers
│   │   ├── schemas/                          # Zod schemas
│   │   └── types/                            # Type definitions
│   └── settings/
│       ├── actions/                          # Feature-specific Server Actions
│       ├── components/
│       │   ├── client/
│       │   │   └── ProfileForm/
│       │   │       ├── ProfileForm.tsx
│       │   │       ├── ProfileFormContainer.tsx
│       │   │       ├── ProfileFormPresenter.tsx
│       │   │       ├── useProfileForm.ts
│       │   │       ├── ProfileForm.test.tsx
│       │   │       ├── useProfileForm.test.ts
│       │   │       ├── ProfileForm.stories.tsx
│       │   │       ├── ProfileFormPresenter.stories.tsx
│       │   │       └── index.ts
│       │   └── server/
│       │       └── ProfilePageTemplate/
│       │           ├── ProfilePageTemplate.tsx
│       │           └── index.ts
│       ├── hooks/
│       └── queries/
├── shared/                                  # Cross-cutting UI & utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── client/                       # Client-side layout components
│   │   │   └── server/                       # Server-side wrappers
│   │   └── ui/                              # Shadcn UI primitives
│   ├── lib/                                  # Utilities
│   └── providers/                            # Context providers
└── external/                                 # Server-only integration layer
    ├── dto/                                  # Zod schemas & DTO definitions
    ├── handler/                              # Command/query server modules (+ token handlers)
    ├── repository/                           # Database access
    ├── service/                              # Domain services
    └── client/                               # External API clients
```

## Component Directory Guidelines

1. Each component folder (`components/client/Foo/`, `components/server/Bar/`) owns a local `index.ts` that re-exports its container, presenter, hooks, and helper types. Stories/tests may also be re-exported for Storybook convenience.
2. The feature-level `components/index.ts` should re-export exclusively from these local barrels so consumers can import via `@/features/<feature>/components`.
3. Follow the Container/Presenter/Hook/Story/Test co-location pattern. Keep stories/tests alongside the component (or under nested `stories/` / `tests/` folders if desired).
4. Use `"use client"` at the top of every client component entry file and keep server components under `components/server/**` to leverage Next.js automatic boundaries.

## Additional Notes

- Only declare `import 'server-only'` in modules under `features/**/servers/**` or `external/**`. Components under `components/server/**` are server-only by location.
- Client components perform mutations via TanStack Query hooks that call `external/handler/**` Server Actions. Never access the database directly from the client.
