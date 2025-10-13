import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useProfilePasswordForm } from './useProfilePasswordForm'

import type { ChangeEvent, FormEvent } from 'react'

const mockUseUpdatePasswordMutation = vi.hoisted(() => vi.fn())
const routerRef = vi.hoisted(() => ({
  current: {
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}))
const mockUseRouter = vi.hoisted(() => vi.fn())

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useUpdatePasswordMutation: () => mockUseUpdatePasswordMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

describe('useProfilePasswordForm', () => {
  beforeEach(() => {
    routerRef.current = {
      replace: vi.fn(),
      refresh: vi.fn(),
    }
    mockUseRouter.mockReturnValue(routerRef.current)
    mockUseUpdatePasswordMutation.mockReset()
  })

  type UpdatePasswordMutationResult = ReturnType<
    (typeof import('@/features/settings/hooks/useProfileMutations'))['useUpdatePasswordMutation']
  >

  const createMutationMock = () =>
    ({
      mutateAsync: vi.fn(),
      isPending: false,
    }) as unknown as UpdatePasswordMutationResult

  const fillForm = async (
    register: ReturnType<typeof useProfilePasswordForm>['register']
  ) => {
    const current = register('currentPassword')
    const next = register('newPassword')
    const confirm = register('confirmPassword')

    await act(async () => {
      current.onChange?.({
        target: { value: 'current123', name: 'currentPassword' },
      } as unknown as ChangeEvent<HTMLInputElement>)
      next.onChange?.({
        target: { value: 'nextPassword1', name: 'newPassword' },
      } as unknown as ChangeEvent<HTMLInputElement>)
      confirm.onChange?.({
        target: { value: 'nextPassword1', name: 'confirmPassword' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })
  }

  it('submits password update and navigates to login', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({ success: true })
    mockUseUpdatePasswordMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfilePasswordForm({ accountId: 'account-1' })
    )

    await fillForm(result.current.register)

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mutation.mutateAsync).toHaveBeenCalledWith({
        accountId: 'account-1',
        currentPassword: 'current123',
        newPassword: 'nextPassword1',
      })
    )

    expect(routerRef.current.replace).toHaveBeenCalledWith(
      '/login?passwordUpdated=1'
    )
    expect(routerRef.current.refresh).toHaveBeenCalled()
    expect(result.current.serverError).toBeNull()
  })

  it('stores returned error message when update fails', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({
      success: false,
      error: 'Passwords did not match',
    })
    mockUseUpdatePasswordMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfilePasswordForm({ accountId: 'account-1' })
    )

    await fillForm(result.current.register)

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Passwords did not match')
    )
    expect(routerRef.current.replace).not.toHaveBeenCalled()
  })

  it('captures thrown errors from mutation', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockRejectedValue(new Error('Network error'))
    mockUseUpdatePasswordMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfilePasswordForm({ accountId: 'account-1' })
    )

    await fillForm(result.current.register)

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Network error')
    )
    expect(routerRef.current.replace).not.toHaveBeenCalled()
  })

  it('resets fields and clears errors', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({ success: true })
    mockUseUpdatePasswordMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfilePasswordForm({ accountId: 'account-1' })
    )

    await fillForm(result.current.register)

    await act(async () => {
      await result.current.onReset()
    })

    expect(result.current.isDirty).toBe(false)
    expect(result.current.serverError).toBeNull()
  })

  it('exposes pending overlay state from mutation', () => {
    const mutation = createMutationMock()
    mutation.isPending = true
    mockUseUpdatePasswordMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfilePasswordForm({ accountId: 'account-1' })
    )

    expect(result.current.isPendingOverlayVisible).toBe(true)
    expect(result.current.isSubmitting).toBe(true)
  })
})
