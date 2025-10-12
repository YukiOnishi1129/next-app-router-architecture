import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'
import { user } from '@/test/test-utils'

import { ProfilePasswordFormContainer } from './ProfilePasswordFormContainer'

const mutateAsync = vi.fn()

vi.mock('@/features/settings/hooks/useProfileMutations', () => ({
  useUpdatePasswordMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

describe('ProfilePasswordFormContainer', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('submits password update', async () => {
    mutateAsync.mockResolvedValueOnce({ success: true })

    render(<ProfilePasswordFormContainer accountId="account-1" />)

    await user.type(
      screen.getByLabelText('Current password'),
      'currentPassword123'
    )
    await user.type(screen.getByLabelText('New password'), 'newPassword456')
    await user.type(
      screen.getByLabelText('Confirm new password'),
      'newPassword456'
    )

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        accountId: 'account-1',
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword456',
      })
    )
  })
})
