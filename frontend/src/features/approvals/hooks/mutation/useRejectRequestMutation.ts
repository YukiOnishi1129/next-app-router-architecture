'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approvalKeys } from '@/features/approvals/queries/keys'
import { notificationKeys } from '@/features/notifications/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'

import { rejectRequestAction } from '@/external/handler/request/command.action'

export const useRejectRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: {
      requestId: string
      reason: string
    }) => {
      const result = await rejectRequestAction({ requestId, reason })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to reject request')
      }
      return { requestId }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: approvalKeys.pending(),
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(variables.requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.history(variables.requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(),
        }),
      ])
    },
  })
}
