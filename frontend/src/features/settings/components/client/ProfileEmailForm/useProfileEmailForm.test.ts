import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useProfileEmailForm } from './useProfileEmailForm'

import type { ChangeEvent, FormEvent } from 'react'

const mockUseRequestEmailChangeMutation = vi.hoisted(() => vi.fn())
const routerRef = vi.hoisted(() => ({
  current: {
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}))
const mockUseRouter = vi.hoisted(() => vi.fn())

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useRequestEmailChangeMutation: () => mockUseRequestEmailChangeMutation(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

describe('useProfileEmailForm', () => {
  beforeEach(() => {
    routerRef.current = {
      replace: vi.fn(),
      refresh: vi.fn(),
    }
    mockUseRouter.mockReturnValue(routerRef.current)
    mockUseRequestEmailChangeMutation.mockReset()
  })

  type RequestEmailChangeMutationResult = ReturnType<
    (typeof import('@/features/settings/hooks/useProfileMutations'))['useRequestEmailChangeMutation']
  >

  const createMutationMock = () =>
    ({
      mutateAsync: vi.fn(),
      isPending: false,
    }) as unknown as RequestEmailChangeMutationResult

  it('submits new email and navigates to confirmation', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({ success: true })
    mockUseRequestEmailChangeMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfileEmailForm({
        accountId: 'account-1',
        initialEmail: 'old@example.com',
      })
    )

    const emailField = result.current.register('email')

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'new@example.com', name: 'email' },
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
        newEmail: 'new@example.com',
      })
    )

    expect(routerRef.current.replace).toHaveBeenCalledWith(
      '/auth/email-change/requested'
    )
    await waitFor(() => expect(result.current.isDirty).toBe(false))
    expect(result.current.serverError).toBeNull()
  })

  it('resets the form to the latest saved email', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockResolvedValue({ success: true })
    mockUseRequestEmailChangeMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfileEmailForm({
        accountId: 'account-1',
        initialEmail: 'old@example.com',
      })
    )

    const emailField = result.current.register('email')

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'new@example.com', name: 'email' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() => expect(result.current.isDirty).toBe(false))

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'another@example.com', name: 'email' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.isDirty).toBe(true)

    await act(async () => {
      result.current.onReset()
    })

    expect(result.current.isDirty).toBe(false)
    expect(result.current.serverError).toBeNull()
  })

  it('captures server error when mutation fails', async () => {
    const mutation = createMutationMock()
    mutation.mutateAsync.mockRejectedValue(new Error('Request failed'))
    mockUseRequestEmailChangeMutation.mockReturnValue(mutation)

    const { result } = renderHook(() =>
      useProfileEmailForm({
        accountId: 'account-1',
        initialEmail: 'old@example.com',
      })
    )

    const emailField = result.current.register('email')

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'new@example.com', name: 'email' },
      } as unknown as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Request failed')
    )
    expect(routerRef.current.replace).not.toHaveBeenCalled()
  })
})
