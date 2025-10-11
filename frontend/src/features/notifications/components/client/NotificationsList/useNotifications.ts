'use client'

import { useMemo } from 'react'

import { useNotificationsQuery } from '@/features/notifications/hooks/query/useNotificationsQuery'
import { mapNotificationDto } from '@/features/notifications/queries/notifications.helpers'

import type { NotificationItem } from '@/features/notifications/types'

export const useNotifications = (unreadOnly = false) => {
  const { data, isLoading, isFetching, error } =
    useNotificationsQuery(unreadOnly)

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!data?.notifications) {
      return []
    }
    return data.notifications.map(mapNotificationDto)
  }, [data])

  return {
    notifications,
    total: data?.total ?? notifications.length,
    unreadCount: data?.unreadCount ?? 0,
    isLoading: isLoading && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
  }
}
