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
│   │   │   │       └── RequestFormPresenter.stories.tsx # Storybook (presenter)
│   │   │   └── server/                       # Server Components (page templates)
│   │   │       └── NewRequestPageTemplate/
│   │   │           └── NewRequestPageTemplate.tsx
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
│       │   │       └── ProfileFormPresenter.stories.tsx
│       │   └── server/
│       │       └── ProfilePageTemplate/
│       │           └── ProfilePageTemplate.tsx
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

1. Avoid barrel exports (`index.ts`) directly under `components/`; import concrete files from pages/containers.
2. Do not add `index.ts` inside `components/client/**`. Export the container (e.g. `RequestForm.tsx`) as the entry point and keep Container/Presenter/Hook/Story/Test co-located.
3. Likewise skip `index.ts` in `components/server/**`. Each server component (page template, layout wrapper) should be imported explicitly.
4. Follow the Container/Presenter/Hook/Story/Test pattern. Place stories/tests alongside the component (or in nested `stories/` and `tests/` folders if preferred).

## Additional Notes

- Only declare `import 'server-only'` in modules under `features/**/servers/**` or `external/**`. Components under `components/server/**` are server-only by location.
- Client components perform mutations via TanStack Query hooks that call `external/handler/**` Server Actions. Never access the database directly from the client.
