import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { ProfilePasswordFormContainer } from './ProfilePasswordFormContainer'

import type { ProfilePasswordFormPresenterProps } from './useProfilePasswordForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseProfilePasswordForm = vi.hoisted(() => vi.fn())

vi.mock('./ProfilePasswordFormPresenter', () => ({
  ProfilePasswordFormPresenter: (props: ProfilePasswordFormPresenterProps) => {
    presenterSpy(props)
    return <div>profile-password-form</div>
  },
}))

vi.mock('./useProfilePasswordForm', () => ({
  useProfilePasswordForm: (
    props: Parameters<typeof ProfilePasswordFormContainer>[0]
  ) => mockUseProfilePasswordForm(props),
}))

describe('ProfilePasswordFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseProfilePasswordForm.mockReset()
  })

  it('delegates to hook and presenter', () => {
    const hookState: ProfilePasswordFormPresenterProps = {
      register:
        vi.fn() as unknown as ProfilePasswordFormPresenterProps['register'],
      errors: {} as ProfilePasswordFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: false,
      isDirty: false,
      serverError: null,
      onReset: vi.fn(),
      isPendingOverlayVisible: false,
    }

    mockUseProfilePasswordForm.mockReturnValue(hookState)

    render(<ProfilePasswordFormContainer accountId="account-1" />)

    expect(mockUseProfilePasswordForm).toHaveBeenCalledWith({
      accountId: 'account-1',
    })
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
