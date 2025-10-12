'use client'

import { ProfilePasswordFormPresenter } from './ProfilePasswordFormPresenter'
import { useProfilePasswordForm } from './useProfilePasswordForm'

type ProfilePasswordFormContainerProps = {
  accountId: string
}

export function ProfilePasswordFormContainer({
  accountId,
}: ProfilePasswordFormContainerProps) {
  const state = useProfilePasswordForm({ accountId })

  return <ProfilePasswordFormPresenter {...state} />
}
