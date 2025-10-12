import { describe, expect, it, vi, beforeEach } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'
import { user } from '@/test/test-utils'

import { ProfileNameFormContainer } from './ProfileNameFormContainer'
import type { Account } from '@/features/account/types/account'

const mutateAsync = vi.fn()
const updateSession = vi.fn()

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useUpdateProfileNameMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/features/auth/hooks/useAuthSession', () => ({
  useAuthSession: () => ({
    update: updateSession,
  }),
}))

describe('ProfileNameFormContainer', () => {
  const updatedAccount: Account = {
    id: 'account-1',
    name: 'Janet',
    email: 'jane@example.com',
    status: 'ACTIVE',
    roles: ['MEMBER'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    mutateAsync.mockReset()
    updateSession.mockReset()
  })

  it('submits an updated name', async () => {
    mutateAsync.mockResolvedValueOnce({ success: true, account: updatedAccount })

    render(
      <ProfileNameFormContainer accountId="account-1" initialName="Jane" />
    )

    const nameInput = screen.getByLabelText('Full name') as HTMLInputElement
    expect(nameInput.value).toBe('Jane')

    await user.clear(nameInput)
    await user.type(nameInput, 'Janet')

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        accountId: 'account-1',
        name: 'Janet',
      })
    )

    await waitFor(() =>
      expect(updateSession).toHaveBeenCalledWith({ account: updatedAccount })
    )
  })
})
