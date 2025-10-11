'use client'

import { useQuery } from '@tanstack/react-query'

import { listNotificationsAction } from '@/features/notifications/actions'
import { notificationKeys } from '@/features/notifications/queries/keys'

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
