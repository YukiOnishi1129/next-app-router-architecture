'use client'

import { EmailChangeLoginFormPresenter } from './EmailChangeLoginFormPresenter'
import { useEmailChangeLoginForm } from './useEmailChangeLoginForm'

export type EmailChangeLoginFormContainerProps = {
  defaultPreviousEmail?: string
}

export const EmailChangeLoginFormContainer = (
  props: EmailChangeLoginFormContainerProps
) => {
  const state = useEmailChangeLoginForm(props.defaultPreviousEmail)

  return <EmailChangeLoginFormPresenter {...state} />
}
