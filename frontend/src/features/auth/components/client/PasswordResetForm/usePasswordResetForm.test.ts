import { describe, expect, it, vi, beforeEach } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { usePasswordResetForm } from './usePasswordResetForm'

const requestPasswordResetCommandAction = vi.fn()

vi.mock('@/external/handler/auth/command.action', () => ({
  requestPasswordResetCommandAction,
}))

describe('usePasswordResetForm', () => {
  beforeEach(() => {
    requestPasswordResetCommandAction.mockReset()
  })

  it('submits password reset action and stores submitted email', async () => {
    requestPasswordResetCommandAction.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => usePasswordResetForm())

    await act(async () => {
      await result.current.onSubmit({
        preventDefault: () => undefined,
        target: { elements: [] },
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(requestPasswordResetCommandAction).toHaveBeenCalled()
    )
  })
})
