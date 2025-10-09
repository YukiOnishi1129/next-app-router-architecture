'use client'

import { SignOutButtonPresenter } from './SignOutButtonPresenter'
import { useSignOutButton } from './useSignOutButton'

export function SignOutButtonContainer() {
  const state = useSignOutButton()
  return <SignOutButtonPresenter {...state} />
}
