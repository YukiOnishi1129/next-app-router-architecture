# Form Handling

This guide documents how we build forms with **React Hook Form** (RHF) and **Zod** in the Request & Approval System. The goal is a predictable, type-safe workflow that keeps validation on both the client and the server.

---

## Principles

1. **Schema first** – Define the Zod schema once, derive TypeScript types from it, and reuse the schema on the server for validation.
2. **Container / Presenter split** – Containers handle RHF state and side effects, presenters stay free of form libraries so they are easy to test and reuse.
3. **Progressive enhancement** – Client-side validation improves UX, but every mutation is still validated server-side using the same schema.
4. **Inline business logic stays in hooks** – Complex transforms or mutation workflows live in dedicated hooks (`useCreateRequest`, `useProfileForm`, etc.).

---

## Basic Pattern

```ts
// features/requests/schemas/createRequest.ts
import { z } from 'zod'

export const createRequestSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(['expense', 'purchase', 'access']),
  amount: z
    .union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)])
    .optional()
    .transform((value) => (typeof value === 'string' ? Number(value) : value)),
  reason: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(10),
  approverId: z.string().uuid(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
```

```tsx
// features/requests/components/client/RequestForm/RequestFormContainer.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createRequestSchema,
  type CreateRequestInput,
} from '@/features/requests/schemas/createRequest'
import { createRequestAction } from '@/features/requests/actions/createRequest.action'
import { RequestFormPresenter } from './RequestFormPresenter'

export function RequestFormContainer() {
  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      type: 'expense',
      amount: undefined,
      reason: '',
      attachments: [],
      approverId: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await createRequestAction(data)
  })

  return <RequestFormPresenter form={form} onSubmit={handleSubmit} />
}
```

---

## Handling Server Errors

1. Wrap RHF submission in `try/catch` and surface server errors through component state.
2. Preserve field-level errors from the server by calling `form.setError`.
3. Display friendly fallback messages (`Unknown error occurred`) when the error is not an `Error` instance.

```tsx
const onSubmit = form.handleSubmit(async (values) => {
  setServerError(null)
  try {
    const result = await action(values)
    if (!result.success) {
      form.setError('root', { message: result.error ?? 'Failed to submit' })
      return
    }
    router.replace(result.redirectUrl ?? '/dashboard')
  } catch (error) {
    setServerError(
      error instanceof Error ? error.message : 'Unexpected error occurred'
    )
  }
})
```

---

## Dynamically Typed Fields

- Use `useFieldArray` for repeatable sections (e.g., attachments).
- Use RHF`s `Controller` when integrating with custom inputs (date pickers, selects).
- Keep derived values in `useMemo` selectors, not in form state.

```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'attachments',
})
```

---

## Server-Side Validation

Every mutation handler imports the same schema to guarantee parity with the client.

```ts
// features/requests/actions/createRequest.action.ts
'use server'

import { createRequestSchema } from '@/features/requests/schemas'
import { createRequestCommandServer } from '@/external/handler/request/command.server'

type Input = z.infer<typeof createRequestSchema>

export async function createRequestAction(rawInput: unknown) {
  const input = createRequestSchema.parse(rawInput)
  return createRequestCommandServer(input)
}
```

---

## Form UX Checklist

- [ ] Disable submit while `formState.isSubmitting`.
- [ ] Reset the form after a successful mutation when appropriate.
- [ ] Use `aria-invalid`, error text, and accessible descriptions.
- [ ] Prevent double submits by calling `event.preventDefault()`.
- [ ] Support keyboard navigation; keep focus on the first error.

---

## Testing

- **Presenter components**: render with `@testing-library/react` and assert rendered markup.
- **Containers/hooks**: mock mutations via `vi.mock` and exercise success/error flows with `renderHook`.
- **Server actions**: unit test validation branches and repository/service interactions in isolation.

```ts
import { act, renderHook } from '@/test/test-utils'

it('submits and redirects on success', async () => {
  mockMutation.mockResolvedValue({ success: true, redirectUrl: '/dashboard' })

  const { result } = renderHook(() => useLoginForm())

  await act(async () => {
    await result.current.onSubmit(fakeFormEvent)
  })

  expect(mockMutation).toHaveBeenCalled()
})
```

---

## Further Reading

- [TanStack Query Implementation Guide](./04-state-management.md)
- [Security Considerations](./10-security.md) – cookies, CSRF, replay protections
- [Testing Strategy](./08-testing-strategy.md)
