import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { ProfileEmailFormContainer } from './ProfileEmailFormContainer'

import type { ProfileEmailFormPresenterProps } from './useProfileEmailForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseProfileEmailForm = vi.hoisted(() => vi.fn())

vi.mock('./ProfileEmailFormPresenter', () => ({
  ProfileEmailFormPresenter: (props: ProfileEmailFormPresenterProps) => {
    presenterSpy(props)
    return <div>profile-email-form</div>
  },
}))

vi.mock('./useProfileEmailForm', () => ({
  useProfileEmailForm: (
    props: Parameters<typeof ProfileEmailFormContainer>[0]
  ) => mockUseProfileEmailForm(props),
}))

describe('ProfileEmailFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseProfileEmailForm.mockReset()
  })

  it('passes props and state to presenter', () => {
    const hookState: ProfileEmailFormPresenterProps = {
      register:
        vi.fn() as unknown as ProfileEmailFormPresenterProps['register'],
      errors: {} as ProfileEmailFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: false,
      isDirty: false,
      serverError: null,
      onReset: vi.fn(),
      isPendingOverlayVisible: false,
    }

    mockUseProfileEmailForm.mockReturnValue(hookState)

    const props = { accountId: 'account-1', initialEmail: 'user@example.com' }

    render(<ProfileEmailFormContainer {...props} />)

    expect(mockUseProfileEmailForm).toHaveBeenCalledWith(props)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
