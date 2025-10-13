import { vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { PasswordInput } from './PasswordInput'

const mockUsePasswordInput = vi.hoisted(() => vi.fn())

vi.mock('./usePasswordInput', () => ({
  usePasswordInput: mockUsePasswordInput,
}))

describe('PasswordInput container', () => {
  it('renders presenter with toggle state', () => {
    const toggle = vi.fn()
    mockUsePasswordInput.mockReturnValue({
      showPassword: true,
      togglePasswordVisibility: toggle,
    })

    render(<PasswordInput aria-label="Password" />)

    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('text')
  })
})
