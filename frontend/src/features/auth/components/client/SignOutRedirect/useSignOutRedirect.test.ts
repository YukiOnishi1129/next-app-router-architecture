import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useSignOutRedirect } from './useSignOutRedirect'

const mockHandleSignOut = vi.fn()

vi.mock('@/features/auth/hooks/useSignOut', () => ({
  useSignOut: () => ({ handleSignOut: mockHandleSignOut }),
}))

describe('useSignOutRedirect', () => {
  beforeEach(() => {
    mockHandleSignOut.mockReset()
  })

  it('invokes sign out with defaults', async () => {
    const { result } = renderHook(() => useSignOutRedirect({}))

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    expect(mockHandleSignOut).toHaveBeenCalledWith('/login', {
      previousEmail: undefined,
    })
    expect(result.current.message).toBe('Signing you out…')
  })

  it('supports custom message and redirect target', async () => {
    const { result } = renderHook(() =>
      useSignOutRedirect({
        redirectTo: '/custom-target',
        previousEmail: 'old@example.com',
        message: 'Signing out from tests…',
      })
    )

    await act(async () => {
      await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    })

    expect(mockHandleSignOut).toHaveBeenCalledWith('/custom-target', {
      previousEmail: 'old@example.com',
    })
    expect(result.current.message).toBe('Signing out from tests…')
  })
})
