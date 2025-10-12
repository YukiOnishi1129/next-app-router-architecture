'use client'

import { PasswordResetFormPresenter } from './PasswordResetFormPresenter'
import { usePasswordResetForm } from './usePasswordResetForm'

export function PasswordResetFormContainer() {
  const state = usePasswordResetForm()

  return <PasswordResetFormPresenter {...state} />
}
