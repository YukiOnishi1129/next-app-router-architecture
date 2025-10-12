import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useSignOutPage } from './useSignOutPage'

const mockHandleSignOut = vi.fn()

vi.mock('@/features/auth/hooks/useSignOut', () => ({
  useSignOut: () => ({ handleSignOut: mockHandleSignOut }),
}))

describe('useSignOutPage', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    mockHandleSignOut.mockReset()
    consoleSpy.mockClear()
  })

  it('signs out successfully and returns presentation data', async () => {
    mockHandleSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useSignOutPage())

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))

    expect(result.current.title).toBe('Signing out…')
    expect(result.current.description).toContain('redirecting you to the login page')
    expect(result.current.errorMessage).toBeUndefined()
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('captures errors when sign out fails', async () => {
    const testError = new Error('boom')
    mockHandleSignOut.mockRejectedValueOnce(testError)

    const { result } = renderHook(() => useSignOutPage())

    await act(async () => {
      await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    })

    expect(result.current.errorMessage).toBe(
      'We ran into a problem signing you out. Please try again.'
    )
    expect(consoleSpy).toHaveBeenCalledWith('Failed to sign out', testError)
  })
})
