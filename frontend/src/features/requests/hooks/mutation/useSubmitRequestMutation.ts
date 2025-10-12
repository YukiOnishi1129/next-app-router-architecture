'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { notificationKeys } from '@/features/notifications/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'

import { submitRequestAction } from '@/external/handler/request/command.action'

export const useSubmitRequestMutation = (requestId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await submitRequestAction({ requestId })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to submit request')
      }
      return result
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(requestId),
        }),
        queryClient.invalidateQueries({ queryKey: requestKeys.all }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(false),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(true),
        }),
      ])
    },
  })
}
