'use client'

import { useState } from 'react'

import { NotificationsListPresenter } from './NotificationsListPresenter'
import { useNotifications } from './useNotifications'

const _TAB_VALUES = ['unread', 'all'] as const
type TabValue = (typeof _TAB_VALUES)[number]

export function NotificationsListContainer() {
  const [activeTab, setActiveTab] = useState<TabValue>('unread')
  const {
    notifications,
    unreadNotifications,
    total,
    unreadCount,
    isLoading,
    isRefetching,
    errorMessage,
    markRead,
    isMarkingRead,
  } = useNotifications(false)

  return (
    <NotificationsListPresenter
      notifications={notifications}
      unreadNotifications={unreadNotifications}
      total={total}
      unreadCount={unreadCount}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onNotificationClick={async (notificationId) => {
        if (isMarkingRead) {
          return
        }
        try {
          await markRead({ notificationId })
        } catch (error) {
          console.error('Failed to mark notification read', error)
        }
      }}
    />
  )
}
