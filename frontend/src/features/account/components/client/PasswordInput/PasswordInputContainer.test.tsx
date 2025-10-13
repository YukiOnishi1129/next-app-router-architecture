import { forwardRef } from 'react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { PasswordInputContainer } from './PasswordInputContainer'

import type { PasswordInputPresenterProps } from './PasswordInputPresenter'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUsePasswordInput = vi.hoisted(() =>
  vi.fn(() => ({
    showPassword: false,
    togglePasswordVisibility: vi.fn(),
  }))
)

vi.mock('./PasswordInputPresenter', () => {
  const MockPasswordInputPresenter = forwardRef<
    HTMLInputElement,
    PasswordInputPresenterProps
  >((props, _ref) => {
    presenterSpy(props)
    return <div data-testid="password-input-presenter" />
  })
  MockPasswordInputPresenter.displayName = 'MockPasswordInputPresenter'

  return {
    PasswordInputPresenter: MockPasswordInputPresenter,
  }
})

vi.mock('./usePasswordInput', () => ({
  usePasswordInput: () => mockUsePasswordInput(),
}))

describe('PasswordInputContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUsePasswordInput.mockClear()
  })

  it('renders presenter with password state and forwards props', () => {
    const toggleSpy = vi.fn()
    mockUsePasswordInput.mockReturnValue({
      showPassword: true,
      togglePasswordVisibility: toggleSpy,
    })

    render(
      <PasswordInputContainer
        hideToggle
        placeholder="Enter password"
        aria-label="Password"
      />
    )

    expect(mockUsePasswordInput).toHaveBeenCalledTimes(1)
    expect(presenterSpy).toHaveBeenCalledTimes(1)

    const [props] = presenterSpy.mock.calls[0] as [PasswordInputPresenterProps]

    expect(props.showPassword).toBe(true)
    expect(props.onTogglePasswordVisibility).toBe(toggleSpy)
    expect(props.hideToggle).toBe(true)
    expect(props.placeholder).toBe('Enter password')
    expect(presenterSpy).toHaveBeenCalled()
  })
})
