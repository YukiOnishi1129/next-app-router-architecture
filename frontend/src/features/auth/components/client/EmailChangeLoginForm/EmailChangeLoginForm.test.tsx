import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { EmailChangeLoginForm } from './EmailChangeLoginForm'

const mockUseEmailChangeLoginForm = vi.hoisted(() => vi.fn())

vi.mock('./useEmailChangeLoginForm', () => ({
  useEmailChangeLoginForm: mockUseEmailChangeLoginForm,
}))

describe('EmailChangeLoginForm container', () => {
  beforeEach(() => {
    mockUseEmailChangeLoginForm.mockReset()
  })

  it('renders presenter with provided state', () => {
    mockUseEmailChangeLoginForm.mockReturnValue({
      register: vi.fn(() => ({ onChange: vi.fn(), onBlur: vi.fn() })),
      errors: {},
      onSubmit: vi.fn(),
      isSubmitting: false,
      serverError: null,
    })

    render(<EmailChangeLoginForm />)

    expect(mockUseEmailChangeLoginForm).toHaveBeenCalled()
    expect(screen.getByLabelText('Previous email')).toBeInTheDocument()
    expect(screen.getByLabelText('New email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })
})
