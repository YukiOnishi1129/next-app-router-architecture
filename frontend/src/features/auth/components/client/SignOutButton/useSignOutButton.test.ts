import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSignOutButton } from './useSignOutButton'

const mockUseLogoutMutation = vi.fn()
const mockRouterReplace = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('@/features/auth/hooks/useLogoutMutation', () => ({
  useLogoutMutation: () => mockUseLogoutMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    refresh: mockRouterRefresh,
  }),
}))

describe('useSignOutButton', () => {
  beforeEach(() => {
    mockUseLogoutMutation.mockReset()
    mockRouterReplace.mockReset()
    mockRouterRefresh.mockReset()
  })

  it('invokes mutation and redirects on success', () => {
    const mutate = vi.fn((_, options) => {
      options?.onSuccess?.({ success: true })
    })

    mockUseLogoutMutation.mockReturnValue({
      mutate,
      isPending: false,
    })

    const { result } = renderHook(() => useSignOutButton())

    act(() => {
      result.current.onSignOut()
    })

    expect(mutate).toHaveBeenCalled()
    expect(mockRouterReplace).toHaveBeenCalledWith('/login')
    expect(mockRouterRefresh).toHaveBeenCalled()
  })
})
