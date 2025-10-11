'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { notificationKeys } from '@/features/notifications/queries/keys'
import { markNotificationReadAction } from '@/external/handler/notification/command.action'

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      const result = await markNotificationReadAction({ notificationId })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to mark notification read')
      }
      return notificationId
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.list(false),
      })
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.list(true),
      })
    },
  })
}
