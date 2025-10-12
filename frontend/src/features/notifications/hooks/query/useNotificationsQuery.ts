'use client'

import { useQuery } from '@tanstack/react-query'

import { notificationKeys } from '@/features/notifications/queries/keys'

import { listNotificationsAction } from '@/external/handler/notification/query.action'

export const useNotificationsQuery = (unreadOnly = false) =>
  useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: async () => {
      const response = await listNotificationsAction({ unreadOnly })
      if (!response.success || !response.notifications) {
        throw new Error(response.error ?? 'Failed to load notifications')
      }
      return response
    },
  })
