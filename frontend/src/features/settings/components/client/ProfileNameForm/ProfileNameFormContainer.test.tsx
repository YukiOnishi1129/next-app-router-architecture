import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { ProfileNameFormContainer } from './ProfileNameFormContainer'

import type { ProfileNameFormPresenterProps } from './useProfileNameForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseProfileNameForm = vi.hoisted(() => vi.fn())

vi.mock('./ProfileNameFormPresenter', () => ({
  ProfileNameFormPresenter: (props: ProfileNameFormPresenterProps) => {
    presenterSpy(props)
    return <div>profile-name-form</div>
  },
}))

vi.mock('./useProfileNameForm', () => ({
  useProfileNameForm: (props: Parameters<typeof ProfileNameFormContainer>[0]) =>
    mockUseProfileNameForm(props),
}))

describe('ProfileNameFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseProfileNameForm.mockReset()
  })

  it('renders presenter with hook state', () => {
    const hookState: ProfileNameFormPresenterProps = {
      register: vi.fn() as unknown as ProfileNameFormPresenterProps['register'],
      errors: {} as ProfileNameFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: true,
      isDirty: true,
      serverError: 'Failed',
      onReset: vi.fn(),
    }

    mockUseProfileNameForm.mockReturnValue(hookState)

    const props = { accountId: 'account-1', initialName: 'Alice' }

    render(<ProfileNameFormContainer {...props} />)

    expect(mockUseProfileNameForm).toHaveBeenCalledWith(props)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
