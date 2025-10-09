'use client'

import { SignUpFormPresenter } from './SignUpFormPresenter'
import { useSignUpForm } from './useSignUpForm'

export function SignUpFormContainer() {
  const state = useSignUpForm()
  return <SignUpFormPresenter {...state} />
}
