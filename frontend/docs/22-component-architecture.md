# Component Architecture Guide

This document describes how we organise and implement components inside `features/**/components`. It extends the guidance from `01-directory-structure.md` and `06-ui-components.md`, covering both client and server concerns.

---

## 1. Directory layout

```
features/<feature>/components/
├── client/                        # Client-only components (“use client” required)
│   └── Foo/
│       ├── Foo.tsx                # Barrel export for the container
│       ├── FooContainer.tsx       # Orchestrates hooks and side effects
│       ├── FooPresenter.tsx       # Pure presentational component
│       ├── useFoo.ts              # Business-logic hook
│       ├── Foo.test.tsx           # Container integration test
│       ├── useFoo.test.ts         # Hook unit test
│       ├── Foo.stories.tsx        # Storybook (container)
│       ├── FooPresenter.stories.tsx # Storybook (presenter)
│       └── index.ts               # Local barrel (exports container/presenter/hook)
└── server/                        # Server components (server-only by location)
    └── BarPageTemplate/
        ├── BarPageTemplate.tsx
        ├── BarPageTemplate.test.tsx
        └── index.ts               # Local barrel (exports server component and helpers)
```

- **Client folder**
  - Always start files with `"use client"`; they can rely on React hooks, browser APIs, and mutable state.
  - Containers and presenters are separated. Presenters accept props and render declaratively; containers fetch data, wire hooks, and invoke mutations.
  - Reusable business logic belongs in hooks (`useFoo.ts`). If a hook is shared across features, lift it to `features/<feature>/hooks` or `shared/hooks`.
- **Server folder**
  - Merely placing a file under `components/server/**` is enough for Next.js to treat it as a Server Component—`import 'server-only'` is not required.
  - Server components should focus on data fetching and orchestration. If client interactivity is needed, split out a client container and pass props down.

---

## 2. Naming and responsibilities

| File | Responsibility |
| ---- | -------------- |
| `FooContainer.tsx` | Manages state, side effects, external service calls, and passes props to the presenter. |
| `FooPresenter.tsx` | Pure UI. Receives data via props and renders without side effects. |
| `useFoo.ts` | Encapsulates business logic used by the container (forms, mutations, derived state). |
| `Foo.tsx` | Barrel export of the container (re-export of `FooContainer`). |
| `index.ts` (inside `Foo/`) | Public barrel that re-exports **only** the component for consumers (`export { Foo } from './Foo'`). Keep hooks/presenters internal. |
| `index.ts` (inside `components/`) | Public surface so consumers can `import { Foo } from '@/features/<feature>/components'`. |
| `index.ts` (inside `server/<Component>/`) | Local barrel for server-side exports; keeps server imports consistent (`import { BarPageTemplate } from '@/features/<feature>/components/server'`). |

Standalone UI pieces (e.g., `PasswordInput`) that have no external dependencies can live as a single presenter file. They should still sit under `components/client` when they rely on client-side state and must prefix the file with `"use client"`.  
Even in this case, add an `index.ts` inside the component folder (e.g. `client/PasswordInput/index.ts`) that re-exports only the component (`export { PasswordInput } from './PasswordInput'`). The parent `components/index.ts` should re-export exclusively from these local barrels to keep import paths uniform.  
Apply the same rule on the server side: every `components/server/<Component>/` directory owns an `index.ts` that exports the page template / partial and any helper functions.

---

## 3. Client vs. server responsibilities

### Client components

- Use React Hook Form, TanStack Query, router APIs, etc.
- Keep complex effects (API calls, navigation) inside containers or dedicated hooks; presenters may own local UI state (e.g., toggles) but **must not** contain side effects, async flows, or service calls.
- When logic in a container grows, move it into a dedicated hook (`useFoo.ts`) so both the container and tests stay focused.
- Reuse primitives from `shared/components/ui/*`, and merge Tailwind classes via `cn` (`shared/lib/utils`).
- Provide labels (`htmlFor` + `id`), `aria-invalid`, and `aria-describedby` wiring for accessibility.

### Server components

- Fetch data on the server and return plain props to client components where possible.
- Delegate mutations to Server Actions and wrap them with client containers when needed.
- Promote generic UI into `shared/components` so both client and server layers can reuse it. Client-only widgets belong under `shared/components/client`.

---

## 4. Testing and Storybook

- **Presenters**: test with `@testing-library/react`, assert rendered output and accessibility attributes. Provide Storybook stories covering normal, error, and empty states.
- **Containers**: mock hooks/services, verify submission flows, error handling, and integration with Server Actions.
- **Server components**: render in tests with mock props to ensure data appears correctly.

---

## 5. Example: `PasswordInput`

- Implemented as a single presenter (`features/account/components/PasswordInput.tsx`) with internal visibility toggle state—no side effects, so no container is required.
- Exported through `features/account/components/index.ts`, enabling consumers to import with `@/features/account/components`.
- The component follows shared styling conventions (`cn`, Tailwind classes) and exposes accessibility attributes out of the box.

Use the same mental model for larger features: default to the three-layer structure (container, presenter, hook) unless the component is strictly presentational.

---

## 6. Further reading

- [01-directory-structure.md](./01-directory-structure.md)
- [05-form-handling.md](./05-form-handling.md)
- [06-ui-components.md](./06-ui-components.md)
- [08-testing-strategy.md](./08-testing-strategy.md)
- [15-storybook.md](./15-storybook.md)
