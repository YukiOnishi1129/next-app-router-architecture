import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { PasswordResetFormContainer } from './PasswordResetFormContainer'

import type { PasswordResetFormPresenterProps } from './usePasswordResetForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUsePasswordResetForm = vi.hoisted(() => vi.fn())

vi.mock('./PasswordResetFormPresenter', () => ({
  PasswordResetFormPresenter: (props: PasswordResetFormPresenterProps) => {
    presenterSpy(props)
    return <div data-testid="password-reset-form-presenter" />
  },
}))

vi.mock('./usePasswordResetForm', () => ({
  usePasswordResetForm: () => mockUsePasswordResetForm(),
}))

describe('PasswordResetFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUsePasswordResetForm.mockReset()
  })

  it('connects hook state to presenter', () => {
    const hookState: PasswordResetFormPresenterProps = {
      register:
        vi.fn() as unknown as PasswordResetFormPresenterProps['register'],
      errors: {} as PasswordResetFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: false,
      serverError: null,
      submittedEmail: null,
    }

    mockUsePasswordResetForm.mockReturnValue(hookState)

    render(<PasswordResetFormContainer />)

    expect(mockUsePasswordResetForm).toHaveBeenCalledTimes(1)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
