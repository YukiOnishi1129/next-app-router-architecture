'use client'

import { NotificationCardPresenter } from './NotificationCardPresenter'

import type { NotificationItem } from '@/features/notifications/types'

type NotificationCardContainerProps = {
  notification: NotificationItem
  onClick: (notificationId: string) => Promise<void>
}

export function NotificationCardContainer({
  notification,
  onClick,
}: NotificationCardContainerProps) {
  return (
    <NotificationCardPresenter notification={notification} onClick={onClick} />
  )
}
