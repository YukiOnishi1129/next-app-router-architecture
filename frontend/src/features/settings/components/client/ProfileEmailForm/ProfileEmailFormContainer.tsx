'use client'

import { ProfileEmailFormPresenter } from './ProfileEmailFormPresenter'
import { useProfileEmailForm } from './useProfileEmailForm'

type ProfileEmailFormContainerProps = {
  accountId: string
  initialEmail: string
}

export function ProfileEmailFormContainer(
  props: ProfileEmailFormContainerProps
) {
  const state = useProfileEmailForm(props)

  return <ProfileEmailFormPresenter {...state} />
}
