'use client'

import { RetryableError } from '@/shared/components/ui/retryable-error'

import type { ProfileFormErrorState } from './useProfileForm'

type ProfileFormErrorProps = Omit<ProfileFormErrorState, 'status'>

export function ProfileFormError({ message, retry }: ProfileFormErrorProps) {
  return (
    <RetryableError
      title="プロフィールの取得に失敗しました"
      description={message}
      onRetry={retry}
      retryLabel="もう一度読み込む"
    />
  )
}
