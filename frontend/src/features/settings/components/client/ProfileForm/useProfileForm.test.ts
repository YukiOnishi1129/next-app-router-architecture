import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserRole, UserStatus } from '@/external/domain/user/user'

import { useProfileForm } from '../useProfileForm'

import type { UserDto } from '@/external/dto/user'
import type { FormEvent } from 'react'

const mockUseProfileSettings = vi.fn()

vi.mock('@/features/settings/hooks/useProfileSettings', () => ({
  useProfileSettings: () => mockUseProfileSettings(),
}))

const baseProfile: UserDto = {
  id: 'user_1',
  name: '山田 太郎',
  email: 'user@example.com',
  status: UserStatus.ACTIVE,
  roles: [UserRole.MEMBER],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

beforeEach(() => {
  mockUseProfileSettings.mockReset()
})

describe('useProfileForm', () => {
  it('returns loading state when query is loading', () => {
    mockUseProfileSettings.mockReturnValue({
      profile: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      updateProfile: vi.fn(),
      isUpdating: false,
      updateError: null,
      resetUpdateState: vi.fn(),
    })

    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('loading')
  })

  it('returns error state when query fails', () => {
    const refetch = vi.fn()
    mockUseProfileSettings.mockReturnValue({
      profile: undefined,
      isLoading: false,
      error: new Error('Failed'),
      refetch,
      updateProfile: vi.fn(),
      isUpdating: false,
      updateError: null,
      resetUpdateState: vi.fn(),
    })

    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('error')
    if (result.current.status === 'error') {
      expect(result.current.retry).toBe(refetch)
    }
  })

  it('returns ready state when data is loaded', async () => {
    const updateProfile = vi.fn().mockResolvedValue(baseProfile)
    const resetUpdateState = vi.fn()

    mockUseProfileSettings.mockReturnValue({
      profile: baseProfile,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfile,
      isUpdating: false,
      updateError: null,
      resetUpdateState,
    })

    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('ready')

    if (result.current.status === 'ready') {
      await act(async () => {
        await result.current.props.onSubmit({
          preventDefault: () => undefined,
        } as unknown as FormEvent<HTMLFormElement>)
      })

      expect(updateProfile).toHaveBeenCalled()
    }
  })
})
