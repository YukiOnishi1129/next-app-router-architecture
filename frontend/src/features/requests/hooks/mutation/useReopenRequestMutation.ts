'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { approvalKeys } from '@/features/approvals/queries/keys'
import { reopenRequestAction } from '@/features/requests/actions'
import { requestKeys } from '@/features/requests/queries/keys'

export const useReopenRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const result = await reopenRequestAction({ requestId })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to reopen request')
      }
      return { requestId }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(variables.requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: requestKeys.history(variables.requestId),
        }),
        queryClient.invalidateQueries({
          queryKey: approvalKeys.pending(),
        }),
      ])
    },
  })
}
