import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'

import { SignOutRedirect } from './SignOutRedirect'

const mockHandleSignOut = vi.fn()

vi.mock('@/features/auth/hooks/useSignOut', () => ({
  useSignOut: () => ({ handleSignOut: mockHandleSignOut }),
}))

describe('SignOutRedirect', () => {
  beforeEach(() => {
    mockHandleSignOut.mockReset()
  })

  it('renders message and triggers sign-out with defaults', async () => {
    mockHandleSignOut.mockResolvedValue(undefined)

    render(<SignOutRedirect />)

    expect(screen.getByText('Please wait')).toBeInTheDocument()
    expect(screen.getByText('Signing you out…')).toBeInTheDocument()

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    expect(mockHandleSignOut).toHaveBeenCalledWith('/login', {
      previousEmail: undefined,
    })
  })

  it('supports custom props', async () => {
    mockHandleSignOut.mockResolvedValue(undefined)

    render(
      <SignOutRedirect
        redirectTo="/signup"
        previousEmail="old@example.com"
        message="Signing you out from tests…"
      />
    )

    expect(screen.getByText('Signing you out from tests…')).toBeInTheDocument()

    await waitFor(() => expect(mockHandleSignOut).toHaveBeenCalledTimes(1))
    expect(mockHandleSignOut).toHaveBeenCalledWith('/signup', {
      previousEmail: 'old@example.com',
    })
  })
})
