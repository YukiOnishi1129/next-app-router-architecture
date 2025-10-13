'use client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor, user } from '@/test/test-utils'

import { requestPasswordResetCommandAction } from '@/external/handler/auth/command.action'

import { PasswordResetForm } from './PasswordResetForm'

vi.mock('@/external/handler/auth/command.action', () => ({
  requestPasswordResetCommandAction: vi.fn(),
}))

const mockedRequestPasswordResetCommandAction = vi.mocked(
  requestPasswordResetCommandAction
)

describe('PasswordResetForm container', () => {
  beforeEach(() => {
    mockedRequestPasswordResetCommandAction.mockReset()
  })

  it('submits password reset request and shows success message', async () => {
    mockedRequestPasswordResetCommandAction.mockResolvedValueOnce({
      success: true,
    })

    render(<PasswordResetForm />)

    await user.type(
      screen.getByLabelText('Email address'),
      'forgot@example.com'
    )

    await user.click(
      screen.getByRole('button', { name: 'Send reset instructions' })
    )

    await waitFor(() =>
      expect(mockedRequestPasswordResetCommandAction).toHaveBeenCalledWith({
        email: 'forgot@example.com',
      })
    )

    await waitFor(() =>
      expect(
        screen.getByText(
          /We sent password reset instructions to forgot@example.com/i
        )
      ).toBeInTheDocument()
    )
  })
})
