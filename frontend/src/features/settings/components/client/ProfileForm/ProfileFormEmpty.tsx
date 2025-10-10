'use client'

import { EmptyState } from '@/shared/components/ui/empty-state'

type ProfileFormEmptyProps = {
  onCreate?: () => void
  actionLabel?: string
}

export function ProfileFormEmpty({
  onCreate,
  actionLabel,
}: ProfileFormEmptyProps) {
  return (
    <EmptyState
      title="No profile information found"
      description="Create your profile to manage notifications and display settings."
      actions={
        onCreate ? (
          <button
            type="button"
            className="text-primary underline"
            onClick={onCreate}
          >
            {actionLabel ?? 'Create profile'}
          </button>
        ) : null
      }
    />
  )
}
