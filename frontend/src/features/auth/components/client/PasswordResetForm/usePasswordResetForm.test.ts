import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChangeEvent, FormEvent } from 'react'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { requestPasswordResetCommandAction } from '@/external/handler/auth/command.action'
import { usePasswordResetForm } from './usePasswordResetForm'

vi.mock('@/external/handler/auth/command.action', () => ({
  requestPasswordResetCommandAction: vi.fn(),
}))

const mockedRequestPasswordResetCommandAction = vi.mocked(
  requestPasswordResetCommandAction
)

describe('usePasswordResetForm', () => {
  beforeEach(() => {
    mockedRequestPasswordResetCommandAction.mockReset()
  })

  it('submits password reset action and tracks submitted email', async () => {
    mockedRequestPasswordResetCommandAction.mockResolvedValueOnce({
      success: true,
    })

    const { result } = renderHook(() => usePasswordResetForm())

    const emailField = result.current.register('email')

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'forgot@example.com', name: 'email' },
      } as unknown as ChangeEvent<HTMLInputElement>)
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mockedRequestPasswordResetCommandAction).toHaveBeenCalledWith({
        email: 'forgot@example.com',
      })
    )

    await waitFor(() =>
      expect(result.current.submittedEmail).toBe('forgot@example.com')
    )
    expect(result.current.serverError).toBeNull()
  })

  it('stores error message when request fails', async () => {
    mockedRequestPasswordResetCommandAction.mockResolvedValueOnce({
      success: false,
      error: 'Failed request',
    })

    const { result } = renderHook(() => usePasswordResetForm())
    const emailField = result.current.register('email')

    await act(async () => {
      emailField.onChange?.({
        target: { value: 'forgot@example.com', name: 'email' },
      } as unknown as ChangeEvent<HTMLInputElement>)
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mockedRequestPasswordResetCommandAction).toHaveBeenCalled()
    )

    expect(result.current.submittedEmail).toBeNull()
    expect(result.current.serverError).toBe('Failed request')
  })
})
