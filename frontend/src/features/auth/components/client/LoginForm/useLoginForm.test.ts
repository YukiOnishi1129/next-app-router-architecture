import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useLoginForm } from './useLoginForm'

const mockHandleSignIn = vi.fn()
const mockRouterReplace = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('@/features/auth/hooks/useSignIn', () => ({
  useSignIn: () => ({ handleSignIn: mockHandleSignIn }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    refresh: mockRouterRefresh,
  }),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    mockHandleSignIn.mockReset()
    mockRouterReplace.mockReset()
    mockRouterRefresh.mockReset()
  })

  it('submits credentials and redirects on success', async () => {
    mockHandleSignIn.mockResolvedValue({ ok: true })

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

    await waitFor(() =>
      expect(mockHandleSignIn).toHaveBeenCalledWith(
        'user@example.com',
        'password123'
      )
    )
    await waitFor(() => expect(mockRouterRefresh).toHaveBeenCalled())
    await waitFor(() =>
      expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard')
    )
  })

  it('sets server error when mutation fails', async () => {
    mockHandleSignIn.mockRejectedValue(new Error('Invalid credentials'))

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

    await waitFor(() =>
      expect(result.current.serverError).toBe('Invalid credentials')
    )
    expect(mockRouterRefresh).not.toHaveBeenCalled()
  })
})
