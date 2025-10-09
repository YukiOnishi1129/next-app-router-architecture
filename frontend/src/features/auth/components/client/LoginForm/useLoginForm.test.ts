import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLoginForm } from './useLoginForm'

const mockUseLoginMutation = vi.fn()
const mockRouterReplace = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('@/features/auth/hooks/useLoginMutation', () => ({
  useLoginMutation: () => mockUseLoginMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    refresh: mockRouterRefresh,
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    mockUseLoginMutation.mockReset()
    mockRouterReplace.mockReset()
    mockRouterRefresh.mockReset()
  })

  it('submits credentials and redirects on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      success: true,
      redirectUrl: '/requests',
    })

    mockUseLoginMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })

    const { result } = renderHook(() => useLoginForm())

    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')

    await act(async () => {
      emailField.onChange({
        target: { value: 'user@example.com', name: 'email' },
      } as never)
      passwordField.onChange({
        target: { value: 'password123', name: 'password' },
      } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(mutateAsync).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
      redirectUrl: '/dashboard',
    })
    expect(mockRouterReplace).toHaveBeenCalledWith('/requests')
    expect(mockRouterRefresh).toHaveBeenCalled()
  })

  it('sets server error when mutation fails', async () => {
    mockUseLoginMutation.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      isPending: false,
    })

    const { result } = renderHook(() => useLoginForm())

    const emailField = result.current.register('email')
    const passwordField = result.current.register('password')

    await act(async () => {
      emailField.onChange({
        target: { value: 'user@example.com', name: 'email' },
      } as never)
      passwordField.onChange({
        target: { value: 'password123', name: 'password' },
      } as never)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(result.current.serverError).toBe('Invalid credentials')
    expect(mockRouterRefresh).not.toHaveBeenCalled()
  })
})
