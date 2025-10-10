# Storybook Guide

We use Storybook as a visual documentation tool and isolated development environment.

---

## Goals

1. Document component structure and usage.
2. Showcase visual states (loading, empty, error) without wiring the full app.
3. Provide a playground for designers and QA to review UI.

---

## Project Layout

```
components/
└── ThreadTextarea/
    ├── ThreadTextarea.tsx                  # Container re-export
    ├── ThreadTextareaContainer.tsx         # Hooks + state orchestration
    ├── ThreadTextareaPresenter.tsx         # Presentational component
    ├── useThreadTextarea.ts                # Business logic hook
    ├── ThreadTextarea.stories.tsx          # Container docs
    └── ThreadTextareaPresenter.stories.tsx # Presenter variations
```

---

## Story Types

### 1. Container Story (documentation-first)

Use Markdown to explain architecture, props, and links to related docs.

```tsx
const meta: Meta<typeof ThreadTextarea> = {
  title: 'Features/Thread/ThreadTextarea',
  component: ThreadTextarea,
  parameters: {
    docs: {
      description: {
        component: `Container orchestrates form state and mutation wiring.`,
      },
    },
  },
}
```

### 2. Presenter Story (visual states)

Enumerate variations with Storybook controls so designers can toggle props.

```tsx
export const Default: Story = {
  args: {
    value: '',
    isDeepAnalysis: false,
    disabled: false,
  },
}
```

---

## Implementation Tips

- Document structure/responsibilities with Markdown inside stories.
- Provide realistic props; avoid lorem ipsum if real fixtures exist.
- Link to relevant Figma files or product specs when helpful.
- Use `play` functions for interactive demos (optional).

---

## Development Workflow

```bash
pnpm storybook       # start Storybook locally
pnpm build-storybook # generate static docs
```

1. Build the presenter story first (visual states).
2. Wire the container story to explain architecture.
3. Add Vitest coverage for hooks/containers afterwards.

---

## Caveats

- Storybook tests are not part of the CI pipeline; rely on Vitest/Playwright for automation.
- Visual regression testing is not enabled—manual review is required.
- Do not expose secrets in stories (mock data only).

---

## Writing Docs in Stories

```tsx
parameters: {
  docs: {
    description: {
      component: `
### Overview
- Container fetches data via TanStack Query
- Presenter renders list + empty states
      `,
    },
  },
}
```

---

## Summary

- Storybook acts as UI documentation and a component sandbox.
- Container and Presenter stories serve different audiences (developers vs designers).
- Combine Storybook for visuals with Vitest for automation to maintain quality.
