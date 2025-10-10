# Custom Hooks Guide

We rely on custom hooks to encapsulate client-side logic, keep containers thin, and maximise testability. This guide covers patterns for state hooks, data hooks (React Query), and domain-specific workflows.

---

## Principles

1. **One hook per file** – keep hooks discoverable and single-purpose.
2. **Explicit dependencies** – pass parameters rather than importing global state when possible.
3. **React Query for data** – prefer `useQuery`/`useMutation` wrappers over manual fetch state.
4. **Testability** – hooks should be testable with `renderHook` and mocked dependencies.

---

## Structure

```
features/<feature>/hooks/
  ├── query/
  │   └── useRequestListQuery.ts
  ├── mutation/
  │   └── useCreateRequestMutation.ts
  └── useApproveRequest.ts
shared/hooks/
  └── useDisclosure.ts
```

---

## Example: Disclosure Hook

```ts
import { useCallback, useState } from 'react'

export const useDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
```

---

## Example: Query Hook

```ts
// features/requests/hooks/query/useRequestListQuery.ts
import { useQuery } from '@tanstack/react-query'
import { requestKeys } from '@/features/requests/queries/keys'
import { listRequestsAction } from '@/external/handler/request/query.action'

export const useRequestListQuery = (filters: RequestFilterInput) =>
  useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => listRequestsAction(filters),
    staleTime: 5 * 60 * 1000,
  })
```

---

## Example: Mutation Hook with Optimistic Update

```ts
export const useApproveRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveRequestAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.id) })
    },
  })
}
```

---

## Form Hooks

```ts
export function useLoginForm() {
  const router = useRouter()
  const { handleSignIn } = useSignIn()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await handleSignIn(values.email, values.password)
      router.refresh()
      router.replace('/dashboard')
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to sign in',
      })
    }
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  }
}
```

---

## Testing Hooks

```ts
import { renderHook, act } from '@/test/test-utils'

it('opens and closes disclosure', () => {
  const { result } = renderHook(() => useDisclosure())
  act(() => result.current.open())
  expect(result.current.isOpen).toBe(true)
})
```

---

## Guidelines Checklist

- [ ] Hook name starts with `use`.
- [ ] Only one hook exported per file.
- [ ] Dependencies declared explicitly (React Query, router, etc.).
- [ ] Side effects wrapped in `useEffect`/`useCallback`.
- [ ] Tests cover success, error, and edge cases.
