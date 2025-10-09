import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSignUpForm } from './useSignUpForm'

const mockUseRegisterMutation = vi.fn()
const mockRouterReplace = vi.fn()

vi.mock('@/features/auth/hooks/useRegisterMutation', () => ({
  useRegisterMutation: () => mockUseRegisterMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}))

describe('useSignUpForm', () => {
  beforeEach(() => {
    mockUseRegisterMutation.mockReset()
    mockRouterReplace.mockReset()
  })

  it('submits values and navigates on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      success: true,
      redirectUrl: '/requests',
    })

    mockUseRegisterMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    act(() => {
      nameField.onChange({ target: { value: '山田 太郎' } } as never)
      emailField.onChange({ target: { value: 'user@example.com' } } as never)
      passwordField.onChange({ target: { value: 'password123' } } as never)
      confirmField.onChange({ target: { value: 'password123' } } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(mutateAsync).toHaveBeenCalledWith({
      name: '山田 太郎',
      email: 'user@example.com',
      password: 'password123',
      redirectUrl: '/dashboard',
    })
    expect(mockRouterReplace).toHaveBeenCalledWith('/requests')
  })

  it('captures server error on failure', async () => {
    mockUseRegisterMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Already exists')),
      isPending: false,
    })

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    act(() => {
      nameField.onChange({ target: { value: '山田 太郎' } } as never)
      emailField.onChange({ target: { value: 'user@example.com' } } as never)
      passwordField.onChange({ target: { value: 'password123' } } as never)
      confirmField.onChange({ target: { value: 'password123' } } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(result.current.serverError).toBe('Already exists')
  })
})
