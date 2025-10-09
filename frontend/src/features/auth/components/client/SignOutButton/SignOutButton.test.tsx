import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SignOutButtonContainer } from './SignOutButtonContainer'

import type { SignOutButtonPresenterProps } from './useSignOutButton'

vi.mock('./SignOutButtonPresenter', () => ({
  SignOutButtonPresenter: (props: SignOutButtonPresenterProps) => (
    <button data-testid="signout-presenter" onClick={props.onSignOut}>
      Sign out
    </button>
  ),
}))

const mockUseSignOutButton = vi.fn<SignOutButtonPresenterProps, []>()

vi.mock('./useSignOutButton', () => ({
  useSignOutButton: () => mockUseSignOutButton(),
}))

afterEach(() => {
  mockUseSignOutButton.mockReset()
})

describe('SignOutButtonContainer', () => {
  it('passes props to presenter', () => {
    const onSignOut = vi.fn()
    mockUseSignOutButton.mockReturnValue({
      onSignOut,
      isSigningOut: false,
    })

    render(<SignOutButtonContainer />)

    fireEvent.click(screen.getByTestId('signout-presenter'))

    expect(onSignOut).toHaveBeenCalled()
  })
})
