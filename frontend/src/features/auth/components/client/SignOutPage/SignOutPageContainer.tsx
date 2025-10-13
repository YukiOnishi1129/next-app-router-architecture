'use client'

import { SignOutPagePresenter } from './SignOutPagePresenter'
import { useSignOutPage } from './useSignOutPage'

export function SignOutPageContainer() {
  const state = useSignOutPage()

  return <SignOutPagePresenter {...state} />
}
