'use client'

import { SignOutRedirectPresenter } from './SignOutRedirectPresenter'
import { useSignOutRedirect } from './useSignOutRedirect'

import type { Route } from 'next'

type SignOutRedirectContainerProps = {
  redirectTo?: Route
  message?: string
  previousEmail?: string
}

export function SignOutRedirectContainer(
  props: SignOutRedirectContainerProps
) {
  const state = useSignOutRedirect(props)

  return <SignOutRedirectPresenter {...state} />
}
