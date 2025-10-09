import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SignUpFormContainer } from './SignUpFormContainer'
import type { SignUpFormPresenterProps } from './useSignUpForm'

vi.mock('./SignUpFormPresenter', () => ({
  SignUpFormPresenter: (props: SignUpFormPresenterProps) => (
    <button data-testid="signup-presenter" onClick={props.onSubmit}>
      Presenter
    </button>
  ),
}))

const mockUseSignUpForm = vi.fn<SignUpFormPresenterProps, []>()

vi.mock('./useSignUpForm', () => ({
  useSignUpForm: () => mockUseSignUpForm(),
}))

afterEach(() => {
  mockUseSignUpForm.mockReset()
})

describe('SignUpFormContainer', () => {
  it('passes props to presenter', () => {
    const onSubmit = vi.fn()
    mockUseSignUpForm.mockReturnValue({
      register: vi.fn() as unknown as SignUpFormPresenterProps['register'],
      errors: {},
      onSubmit,
      isSubmitting: false,
      serverError: null,
    })

    render(<SignUpFormContainer />)

    fireEvent.click(screen.getByTestId('signup-presenter'))

    expect(onSubmit).toHaveBeenCalled()
  })
})
