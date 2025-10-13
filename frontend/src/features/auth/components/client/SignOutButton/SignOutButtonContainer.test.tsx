import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { SignOutButtonContainer } from './SignOutButtonContainer'

import type { SignOutButtonPresenterProps } from './useSignOutButton'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseSignOutButton = vi.hoisted(() => vi.fn())

vi.mock('./SignOutButtonPresenter', () => ({
  SignOutButtonPresenter: (props: SignOutButtonPresenterProps) => {
    presenterSpy(props)
    return <button type="button">sign out</button>
  },
}))

vi.mock('./useSignOutButton', () => ({
  useSignOutButton: () => mockUseSignOutButton(),
}))

describe('SignOutButtonContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseSignOutButton.mockReset()
  })

  it('passes hook result to presenter', () => {
    const hookState: SignOutButtonPresenterProps = {
      onSignOut: vi.fn(),
      isSigningOut: false,
    }

    mockUseSignOutButton.mockReturnValue(hookState)

    render(<SignOutButtonContainer />)

    expect(mockUseSignOutButton).toHaveBeenCalledTimes(1)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
