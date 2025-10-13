import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'

import { SignOutPage } from './SignOutPage'

const mockHandleSignOut = vi.fn()

vi.mock('@/features/auth/hooks/useSignOut', () => ({
  useSignOut: () => ({ handleSignOut: mockHandleSignOut }),
}))

describe('SignOutPage', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    mockHandleSignOut.mockReset()
    consoleSpy.mockClear()
  })

  it('renders sign-out messaging and triggers sign-out', async () => {
    mockHandleSignOut.mockResolvedValue(undefined)

    render(<SignOutPage />)

    expect(screen.getByText('Signing out…')).toBeInTheDocument()
    expect(
      screen.getByText(
        'We are securely signing you out and redirecting you to the login page.'
      )
    ).toBeInTheDocument()

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('shows error message when sign-out fails', async () => {
    const testError = new Error('sign out failed')
    mockHandleSignOut.mockRejectedValueOnce(testError)

    render(<SignOutPage />)

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))

    expect(
      screen.getByText(
        'We ran into a problem signing you out. Please try again.'
      )
    ).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to sign out', testError)
  })
})
