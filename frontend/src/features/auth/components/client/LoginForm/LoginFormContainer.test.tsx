import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { LoginFormContainer } from './LoginFormContainer'

import type { LoginFormPresenterProps } from './useLoginForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseLoginForm = vi.hoisted(() => vi.fn())

vi.mock('./LoginFormPresenter', () => ({
  LoginFormPresenter: (props: LoginFormPresenterProps) => {
    presenterSpy(props)
    return <div data-testid="login-form-presenter" />
  },
}))

vi.mock('./useLoginForm', () => ({
  useLoginForm: () => mockUseLoginForm(),
}))

describe('LoginFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseLoginForm.mockReset()
  })

  it('renders presenter with hook state', () => {
    const hookState: LoginFormPresenterProps = {
      register: vi.fn() as unknown as LoginFormPresenterProps['register'],
      errors: {} as LoginFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: true,
      serverError: 'Error',
    }

    mockUseLoginForm.mockReturnValue(hookState)

    render(<LoginFormContainer />)

    expect(mockUseLoginForm).toHaveBeenCalledTimes(1)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
