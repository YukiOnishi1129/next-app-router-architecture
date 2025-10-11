'use client'

import { useMemo } from 'react'

import { useMarkNotificationReadMutation } from '@/features/notifications/hooks/mutation/useMarkNotificationReadMutation'
import { useNotificationsQuery } from '@/features/notifications/hooks/query/useNotificationsQuery'
import { mapNotificationDto } from '@/features/notifications/queries/notifications.helpers'

export const useNotifications = (unreadOnly = false) => {
  const { data, isLoading, isFetching, error, refetch } =
    useNotificationsQuery(unreadOnly)
  const markReadMutation = useMarkNotificationReadMutation()

  const { notifications, unreadNotifications } = useMemo(() => {
    if (!data?.notifications) {
      return { notifications: [], unreadNotifications: [] }
    }
    const mapped = data.notifications.map(mapNotificationDto)
    return {
      notifications: mapped,
      unreadNotifications: mapped.filter((notification) => !notification.read),
    }
  }, [data])

  return {
    notifications,
    unreadNotifications,
    total: data?.total ?? notifications.length,
    unreadCount: data?.unreadCount ?? 0,
    isLoading: isLoading && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
    refetch,
    markRead: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
  }
}
