import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '@/test/test-utils'

import { SignOutRedirectContainer } from './SignOutRedirectContainer'

import type { SignOutRedirectPresenterProps } from './useSignOutRedirect'
import type { Route } from 'next'

type SignOutRedirectContainerProps = {
  redirectTo?: Route
  message?: string
  previousEmail?: string
}

const presenterSpy = vi.hoisted(() => vi.fn())
const mockUseSignOutRedirect = vi.hoisted(() => vi.fn())

vi.mock('./SignOutRedirectPresenter', () => ({
  SignOutRedirectPresenter: (props: SignOutRedirectPresenterProps) => {
    presenterSpy(props)
    return <div>{props.message}</div>
  },
}))

vi.mock('./useSignOutRedirect', () => ({
  useSignOutRedirect: (args: SignOutRedirectContainerProps) =>
    mockUseSignOutRedirect(args),
}))

describe('SignOutRedirectContainer', () => {
  beforeEach(() => {
    presenterSpy.mockClear()
    mockUseSignOutRedirect.mockReset()
  })

  it('delegates props to hook and presenter', () => {
    const hookState: SignOutRedirectPresenterProps = {
      message: 'Signing out now…',
    }

    mockUseSignOutRedirect.mockReturnValue(hookState)

    const props: SignOutRedirectContainerProps = {
      redirectTo: '/dashboard' as Route,
      message: 'Custom sign-out',
      previousEmail: 'user@example.com',
    }

    render(<SignOutRedirectContainer {...props} />)

    expect(mockUseSignOutRedirect).toHaveBeenCalledWith(props)
    expect(presenterSpy).toHaveBeenCalledWith(hookState)
  })
})
