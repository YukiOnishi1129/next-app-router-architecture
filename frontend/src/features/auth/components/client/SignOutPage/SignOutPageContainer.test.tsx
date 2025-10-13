import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { SignOutPageContainer } from './SignOutPageContainer'

import type { SignOutPagePresenterProps } from './useSignOutPage'

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseSignOutPage = vi.hoisted(() => vi.fn())

vi.mock('./SignOutPagePresenter', () => ({
  SignOutPagePresenter: (props: SignOutPagePresenterProps) => {
    presenterSpy(props)
    return <div>{props.title}</div>
  },
}))

vi.mock('./useSignOutPage', () => ({
  useSignOutPage: () => mockUseSignOutPage(),
}))

describe('SignOutPageContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseSignOutPage.mockReset()
  })

  it('renders presenter with hook data', () => {
    const hookState: SignOutPagePresenterProps = {
      title: 'Signing out…',
      description: 'Please wait',
      errorMessage: undefined,
    }

    mockUseSignOutPage.mockReturnValue(hookState)

    render(<SignOutPageContainer />)

    expect(mockUseSignOutPage).toHaveBeenCalledTimes(1)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
