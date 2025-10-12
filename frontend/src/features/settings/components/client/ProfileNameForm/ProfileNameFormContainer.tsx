'use client'

import { ProfileNameFormPresenter } from './ProfileNameFormPresenter'
import { useProfileNameForm } from './useProfileNameForm'

type ProfileNameFormContainerProps = {
  accountId: string
  initialName: string
}

export function ProfileNameFormContainer(props: ProfileNameFormContainerProps) {
  const state = useProfileNameForm(props)

  return <ProfileNameFormPresenter {...state} />
}
