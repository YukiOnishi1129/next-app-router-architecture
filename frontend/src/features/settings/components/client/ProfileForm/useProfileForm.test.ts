import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProfileForm } from './useProfileForm'

import type { FormEvent } from 'react'

const mockUseProfileSettingsQuery = vi.fn()
const mockUseUpdateProfileMutation = vi.fn()

vi.mock('@/features/settings/hooks/useProfileSettingsQuery', () => ({
  useProfileSettingsQuery: () => mockUseProfileSettingsQuery(),
}))

vi.mock('@/features/settings/hooks/useUpdateProfileMutation', () => ({
  useUpdateProfileMutation: () => mockUseUpdateProfileMutation(),
}))

const baseProfile = {
  id: 'user_1',
  name: '山田 太郎',
  email: 'user@example.com',
  status: 'ACTIVE',
  roles: ['MEMBER'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

beforeEach(() => {
  mockUseProfileSettingsQuery.mockReset()
  mockUseUpdateProfileMutation.mockReset()
})

describe('useProfileForm', () => {
  it('returns loading state when query is loading', () => {
    mockUseProfileSettingsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    mockUseUpdateProfileMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    })

    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('loading')
  })

  it('returns error state when query fails', () => {
    const refetch = vi.fn()
    mockUseProfileSettingsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
      refetch,
    })

    mockUseUpdateProfileMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    })
    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('error')
    if (result.current.status === 'error') {
      expect(result.current.retry).toBe(refetch)
    }
  })

  it('returns ready state when data is loaded', async () => {
    const mutateAsync = vi
      .fn()
      .mockResolvedValue({ success: true, user: baseProfile })
    const reset = vi.fn()
    const refetch = vi.fn()

    mockUseProfileSettingsQuery.mockReturnValue({
      data: baseProfile,
      isLoading: false,
      error: null,
      refetch,
    })

    mockUseUpdateProfileMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
      reset,
    })
    const { result } = renderHook(() => useProfileForm())

    expect(result.current.status).toBe('ready')

    if (result.current.status === 'ready') {
      const readyState = result.current
      await act(async () => {
        readyState.props.onSubmit({
          preventDefault: () => undefined,
        } as unknown as FormEvent<HTMLFormElement>)
      })

      expect(mutateAsync).toHaveBeenCalled()
    }
  })
})
