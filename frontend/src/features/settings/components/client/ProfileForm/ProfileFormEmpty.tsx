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
      title="プロフィール情報が見つかりません"
      description="プロフィールを設定して、通知や表示情報を管理しましょう。"
      actions={
        onCreate ? (
          <button
            type="button"
            className="text-primary underline"
            onClick={onCreate}
          >
            {actionLabel ?? 'プロフィールを設定する'}
          </button>
        ) : null
      }
    />
  )
}
