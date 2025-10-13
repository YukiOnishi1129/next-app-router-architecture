import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { EmailChangeLoginFormContainer } from './EmailChangeLoginFormContainer'

import type { EmailChangeLoginFormPresenterProps } from './useEmailChangeLoginForm'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseEmailChangeLoginForm = vi.hoisted(() => vi.fn())

vi.mock('./EmailChangeLoginFormPresenter', () => ({
  EmailChangeLoginFormPresenter: (
    props: EmailChangeLoginFormPresenterProps
  ) => {
    presenterSpy(props)
    return <div data-testid="email-change-login-presenter" />
  },
}))

vi.mock('./useEmailChangeLoginForm', () => ({
  useEmailChangeLoginForm: (defaultPreviousEmail?: string) =>
    mockUseEmailChangeLoginForm(defaultPreviousEmail),
}))

describe('EmailChangeLoginFormContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseEmailChangeLoginForm.mockReset()
  })

  it('passes hook state to presenter', () => {
    const hookState: EmailChangeLoginFormPresenterProps = {
      register:
        vi.fn() as unknown as EmailChangeLoginFormPresenterProps['register'],
      errors: {} as EmailChangeLoginFormPresenterProps['errors'],
      onSubmit: vi.fn(),
      isSubmitting: false,
      serverError: null,
    }

    mockUseEmailChangeLoginForm.mockReturnValue(hookState)

    render(
      <EmailChangeLoginFormContainer defaultPreviousEmail="old@example.com" />
    )

    expect(mockUseEmailChangeLoginForm).toHaveBeenCalledWith('old@example.com')
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
