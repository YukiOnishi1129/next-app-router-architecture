import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useSignOutButton } from './useSignOutButton'

const mockHandleSignOut = vi.fn()

vi.mock('@/features/auth/hooks/useSignOut', () => ({
  useSignOut: () => ({ handleSignOut: mockHandleSignOut }),
}))

describe('useSignOutButton', () => {
  beforeEach(() => {
    mockHandleSignOut.mockReset()
  })

  it('invokes sign out handler', async () => {
    mockHandleSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useSignOutButton())

    await act(async () => {
      result.current.onSignOut()
    })

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
  })
})
