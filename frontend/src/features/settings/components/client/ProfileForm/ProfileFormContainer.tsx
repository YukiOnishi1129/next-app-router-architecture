'use client'

import { Button } from '@/shared/components/ui/button'

import { ProfileFormPresenter } from './ProfileFormPresenter'
import { useProfileForm } from './useProfileForm'

export function ProfileFormContainer() {
  const state = useProfileForm()

  if (state.status === 'loading') {
    return (
      <p className="text-muted-foreground text-sm">
        プロフィールを読み込み中です…
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-destructive text-sm">{state.message}</p>
        <Button type="button" variant="outline" onClick={state.retry}>
          もう一度読み込む
        </Button>
      </div>
    )
  }

  return <ProfileFormPresenter {...state.props} />
}
