'use client'

import { RetryableError } from '@/shared/components/ui/retryable-error'

import type { ProfileFormErrorState } from './useProfileForm'

type ProfileFormErrorProps = Omit<ProfileFormErrorState, 'status'>

export function ProfileFormError({ message, retry }: ProfileFormErrorProps) {
  return (
    <RetryableError
      title="Failed to load profile"
      description={message}
      onRetry={retry}
      retryLabel="Try again"
    />
  )
}
