'use client'

import { NotificationsListPresenter } from './NotificationsListPresenter'
import { useNotifications } from './useNotifications'

type NotificationsListContainerProps = {
  unreadOnly?: boolean
}

export function NotificationsListContainer({
  unreadOnly = false,
}: NotificationsListContainerProps) {
  const {
    notifications,
    total,
    unreadCount,
    isLoading,
    isRefetching,
    errorMessage,
  } = useNotifications(unreadOnly)

  return (
    <NotificationsListPresenter
      notifications={notifications}
      total={total}
      unreadCount={unreadCount}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
    />
  )
}
