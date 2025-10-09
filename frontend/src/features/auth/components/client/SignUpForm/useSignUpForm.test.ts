import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSignUpForm } from './useSignUpForm'

const mockUseSignUpMutation = vi.fn()
const mockRouterReplace = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('@/features/auth/hooks/useSignUpMutation', () => ({
  useSignUpMutation: () => mockUseSignUpMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    refresh: mockRouterRefresh,
  }),
}))

describe('useSignUpForm', () => {
  beforeEach(() => {
    mockUseSignUpMutation.mockReset()
    mockRouterReplace.mockReset()
    mockRouterRefresh.mockReset()
  })

  it('submits values and navigates on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      success: true,
      redirectUrl: '/requests',
    })

    mockUseSignUpMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    await act(async () => {
      nameField.onChange({
        target: { value: '山田 太郎', name: 'name' },
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

    expect(mutateAsync).toHaveBeenCalledWith({
      name: '山田 太郎',
      email: 'user@example.com',
      password: 'password123',
      redirectUrl: '/dashboard',
    })
    expect(mockRouterReplace).toHaveBeenCalledWith('/requests')
    expect(mockRouterRefresh).toHaveBeenCalled()
  })

  it('captures server error on failure', async () => {
    mockUseSignUpMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Already exists')),
      isPending: false,
    })

    const { result } = renderHook(() => useSignUpForm())

    const nameField = result.current.register('name')
    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')
    const confirmField = result.current.register('confirmPassword')

    await act(async () => {
      nameField.onChange({
        target: { value: '山田 太郎', name: 'name' },
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
      result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(result.current.serverError).toBe('Already exists')
  })
})
