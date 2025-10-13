import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useProfileNameForm } from './useProfileNameForm'

import type { Account } from '@/features/account/types/account'
import type { ChangeEvent, FormEvent } from 'react'

const mockUseUpdateProfileNameMutation = vi.hoisted(() => vi.fn())
const mockUseAuthSession = vi.hoisted(() => vi.fn())
const routerRef = vi.hoisted(() => ({
  current: {
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}))
const mockUseRouter = vi.hoisted(() => vi.fn())

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useUpdateProfileNameMutation: () => mockUseUpdateProfileNameMutation(),
}))

vi.mock('@/features/auth/hooks/useAuthSession', () => ({
  useAuthSession: () => mockUseAuthSession(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

describe('useProfileNameForm', () => {
  beforeEach(() => {
    routerRef.current = {
      replace: vi.fn(),
      refresh: vi.fn(),
    }
    mockUseRouter.mockReturnValue(routerRef.current)
    mockUseUpdateProfileNameMutation.mockReset()
    mockUseAuthSession.mockReset()
  })

  type UpdateProfileNameMutationResult = ReturnType<
    (typeof import('@/features/settings/hooks/useProfileMutations'))['useUpdateProfileNameMutation']
  >

  const createMutationMock = () =>
    ({
      mutateAsync: vi.fn(),
      isPending: false,
    }) as unknown as UpdateProfileNameMutationResult

  const accountResponse: Account = {
    id: 'account-1',
    name: 'Updated Name',
    email: 'user@example.com',
    status: 'ACTIVE',
    roles: ['ADMIN'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('updates profile name, refreshes session, and navigates', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({
      success: true,
      account: accountResponse,
    })
    mockUseUpdateProfileNameMutation.mockReturnValue(mutation)

    const updateSession = vi.fn().mockResolvedValue(undefined)
    mockUseAuthSession.mockReturnValue({
      update: updateSession,
    })

    const { result } = renderHook(() =>
      useProfileNameForm({
        accountId: 'account-1',
        initialName: 'Original Name',
      })
    )

    const nameField = result.current.register('name')

    await act(async () => {
      nameField.onChange?.({
        target: { value: 'Updated Name', name: 'name' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        accountId: 'account-1',
        name: 'Updated Name',
      })
    )

    expect(updateSession).toHaveBeenCalledWith({
      account: accountResponse,
    })
    expect(routerRef.current.replace).toHaveBeenCalledWith(
      '/settings/profile?updated=name'
    )
    expect(routerRef.current.refresh).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isDirty).toBe(false))
    expect(result.current.serverError).toBeNull()
  })

  it('resets the form to the current name', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({
      success: true,
      account: accountResponse,
    })
    mockUseUpdateProfileNameMutation.mockReturnValue(mutation)

    const updateSession = vi.fn().mockResolvedValue(undefined)
    mockUseAuthSession.mockReturnValue({
      update: updateSession,
    })

    const { result } = renderHook(() =>
      useProfileNameForm({
        accountId: 'account-1',
        initialName: 'Original Name',
      })
    )

    const nameField = result.current.register('name')

    await act(async () => {
      nameField.onChange?.({
        target: { value: 'Updated Name', name: 'name' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() => expect(result.current.isDirty).toBe(false))

    await act(async () => {
      nameField.onChange?.({
        target: { value: 'Another Name', name: 'name' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.isDirty).toBe(true)

    await act(async () => {
      result.current.onReset()
    })

    expect(result.current.isDirty).toBe(false)
    expect(result.current.serverError).toBeNull()
  })

  it('captures error message when update fails', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockRejectedValue(new Error('Update failed'))
    mockUseUpdateProfileNameMutation.mockReturnValue(mutation)

    const updateSession = vi.fn()
    mockUseAuthSession.mockReturnValue({
      update: updateSession,
    })

    const { result } = renderHook(() =>
      useProfileNameForm({
        accountId: 'account-1',
        initialName: 'Original Name',
      })
    )

    const nameField = result.current.register('name')

    await act(async () => {
      nameField.onChange?.({
        target: { value: 'Updated Name', name: 'name' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Update failed')
    )
    expect(routerRef.current.replace).not.toHaveBeenCalled()
    expect(updateSession).not.toHaveBeenCalled()
  })
})
