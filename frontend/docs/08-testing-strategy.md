# Testing Strategy

The Request & Approval System uses **Vitest** + **Testing Library** for unit/integration coverage. This guide summarises how we test components, hooks, server modules, and external handlers.

---

## Tooling

- **Vitest** for fast unit tests and watch mode
- **@testing-library/react** for DOM assertions
- **@testing-library/user-event** for realistic interactions
- **Happy DOM** (via Vitest config) as our test renderer
- **MSW** can be introduced for API simulation (optional)

Run tests with:

```bash
pnpm test            # watch mode
pnpm test:run        # single run (CI)
pnpm test:coverage   # coverage report
```

---

## Test Types

### Component tests

```tsx
import { render, screen } from '@/test/test-utils'
import { Button } from './Button'

test('fires click handler', async () => {
  const onClick = vi.fn()
  const user = userEvent.setup()
  render(<Button onClick={onClick}>Click me</Button>)
  await user.click(screen.getByRole('button', { name: /click me/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})
```

### Server Component tests

Use the helpers in `@/test/server-component-utils` to render async server components.

```tsx
const { renderServerComponent } = await import('@/test/server-component-utils')
const { getByText } = await renderServerComponent(<DashboardPage />)
expect(getByText('Pending approvals')).toBeInTheDocument()
```

### Form hooks

Use `renderHook` from our testing utilities, which wraps components in `QueryClientProvider` and `SessionProvider`.

```ts
import { renderHook, act } from '@/test/test-utils'

it('submits and redirects', async () => {
  mockHandleSignIn.mockResolvedValue({ ok: true })
  const { result } = renderHook(() => useLoginForm())
  await act(async () => {
    await result.current.onSubmit(fakeEvent)
  })
  expect(mockHandleSignIn).toHaveBeenCalled()
})
```

### External handlers

Mock downstream services/repositories and assert DTO validation + side effects.

```ts
import { loginCommandServer } from '@/external/handler/auth/command.server'

it('rejects invalid payloads', async () => {
  const result = await loginCommandServer({ email: 'bad', password: '' })
  expect(result.success).toBe(false)
})
```

---

## Patterns

1. **Arrange-Act-Assert** – keep tests readable by following AAA.
2. **Prefer roles over test IDs** – e.g. `screen.getByRole('button', { name: /submit/i })`.
3. **Mock responsibly** – use `vi.mock` to isolate dependencies, clear mocks between tests.
4. **Handle async** – wrap updates in `act`, use `waitFor` for async assertions, and `findBy` queries for elements that render later.

---

## Coverage Targets

- Overall: 80%+
- Components: 90%+
- Utilities: 100%
- Server handlers: 80%+

These are guidelines—focus on meaningful coverage rather than percentages.

---

## CI Integration

Example GitHub Actions workflow:

```yaml
name: Test
on: [push, pull_request]

jobs:
  vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: pnpm
      - run: corepack enable pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:run
      - run: pnpm test:coverage
```
