'use client'

import { ProfileFormError } from './ProfileFormError'
import { ProfileFormLoading } from './ProfileFormLoading'
import { ProfileFormPresenter } from './ProfileFormPresenter'
import { useProfileForm } from './useProfileForm'

export function ProfileFormContainer() {
  const state = useProfileForm()

  if (state.status === 'loading') {
    return <ProfileFormLoading />
  }

  if (state.status === 'error') {
    return <ProfileFormError message={state.message} retry={state.retry} />
  }

  return <ProfileFormPresenter {...state.props} />
}
