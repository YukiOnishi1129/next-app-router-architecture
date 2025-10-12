import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useSignUpForm } from './useSignUpForm'

const mockHandleSignUp = vi.fn()
const mockRouterReplace = vi.fn()

vi.mock('@/features/auth/hooks/useSignUp', () => ({
  useSignUp: () => ({ handleSignUp: mockHandleSignUp }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    refresh: vi.fn(),
  }),
}))

describe('useSignUpForm', () => {
  beforeEach(() => {
    mockHandleSignUp.mockReset()
    mockRouterReplace.mockReset()
  })

  it('submits values and navigates on success', async () => {
    mockHandleSignUp.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    await act(async () => {
      nameField.onChange({
        target: { value: 'John Doe', name: 'name' },
      } as never)
      emailField.onChange({
        target: { value: 'user@example.com', name: 'email' },
      } as never)
      passwordField.onChange({
        target: { value: 'password123', name: 'password' },
      } as never)
      confirmField.onChange({
        target: { value: 'password123', name: 'confirmPassword' },
      } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mockHandleSignUp).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
      })
    )
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/check-email')
    )
  })

  it('captures server error on failure', async () => {
    mockHandleSignUp.mockRejectedValue(new Error('Already exists'))

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    await act(async () => {
      nameField.onChange({
        target: { value: 'John Doe', name: 'name' },
      } as never)
      emailField.onChange({
        target: { value: 'user@example.com', name: 'email' },
      } as never)
      passwordField.onChange({
        target: { value: 'password123', name: 'password' },
      } as never)
      confirmField.onChange({
        target: { value: 'password123', name: 'confirmPassword' },
      } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Already exists')
    )
  })
})
