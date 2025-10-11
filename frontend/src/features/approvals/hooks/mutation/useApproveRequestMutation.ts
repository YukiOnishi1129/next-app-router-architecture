'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approvalKeys } from '@/features/approvals/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'

import { approveRequestAction } from '@/external/handler/request/command.action'

export const useApproveRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const result = await approveRequestAction({ requestId })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to approve request')
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
      ])
    },
  })
}
