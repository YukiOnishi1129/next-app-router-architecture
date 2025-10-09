'use client'

import { LoginFormPresenter } from './LoginFormPresenter'
import { useLoginForm } from './useLoginForm'

export function LoginFormContainer() {
  const state = useLoginForm()

  return <LoginFormPresenter {...state} />
}
