import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoginFormContainer } from './LoginFormContainer'

import type { LoginFormPresenterProps } from './useLoginForm'

vi.mock('./LoginFormPresenter', () => ({
  LoginFormPresenter: (props: LoginFormPresenterProps) => (
    <button
      data-testid="login-presenter"
      onClick={() =>
        props.onSubmit({
          preventDefault: () => undefined,
        } as unknown as React.FormEvent<HTMLFormElement>)
      }
    >
      Presenter
    </button>
  ),
}))

const mockUseLoginForm = vi.fn<LoginFormPresenterProps, []>()

vi.mock('./useLoginForm', () => ({
  useLoginForm: () => mockUseLoginForm(),
}))

afterEach(() => {
  mockUseLoginForm.mockReset()
})

describe('LoginFormContainer', () => {
  it('renders presenter with props from hook', () => {
    const onSubmit = vi.fn()
    mockUseLoginForm.mockReturnValue({
      register: vi.fn() as unknown as LoginFormPresenterProps['register'],
      errors: {},
      onSubmit,
      isSubmitting: false,
      serverError: null,
    })

    render(<LoginFormContainer />)

    fireEvent.click(screen.getByTestId('login-presenter'))

    expect(onSubmit).toHaveBeenCalled()
  })
})
