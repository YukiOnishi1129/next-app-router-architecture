import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'
import { user } from '@/test/test-utils'

import { ProfileEmailFormContainer } from './ProfileEmailFormContainer'

const mutateAsync = vi.fn()

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useRequestEmailChangeMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

describe('ProfileEmailFormContainer', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('submits email change request', async () => {
    mutateAsync.mockResolvedValueOnce({
      success: true,
      pendingEmail: 'jane.new@example.com',
    })

    render(
      <ProfileEmailFormContainer
        accountId="account-1"
        initialEmail="jane@example.com"
      />
    )

    const emailInput = screen.getByLabelText('Email address') as HTMLInputElement
    expect(emailInput.value).toBe('jane@example.com')

    await user.clear(emailInput)
    await user.type(emailInput, 'jane.new@example.com')

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        accountId: 'account-1',
        newEmail: 'jane.new@example.com',
      })
    )
  })
})
