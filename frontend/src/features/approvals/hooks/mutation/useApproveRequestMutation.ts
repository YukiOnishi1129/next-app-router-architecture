'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UseMutationOptions } from '@tanstack/react-query'

import { approvalKeys } from '@/features/approvals/queries/keys'
import { notificationKeys } from '@/features/notifications/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'

import { approveRequestAction } from '@/external/handler/request/command.action'

type ApproveVariables = { requestId: string }
type ApproveResult = { requestId: string }

export const useApproveRequestMutation = (
  options?: UseMutationOptions<ApproveResult, Error, ApproveVariables>
) => {
  const queryClient = useQueryClient()
  const {
    onMutate,
    onError,
    onSuccess,
    onSettled,
    ...restOptions
  } = options ?? {}

  return useMutation({
    mutationFn: async ({ requestId }: ApproveVariables) => {
      const result = await approveRequestAction({ requestId })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to approve request')
      }
      return { requestId }
    },
    onMutate,
    onError,
    onSuccess: async (data, variables, context) => {
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
      if (onSuccess) {
        await onSuccess(data, variables, context)
      }
    },
    onSettled: async (data, error, variables, context) => {
      if (onSettled) {
        await onSettled(data, error, variables, context)
      }
    },
    ...restOptions,
  })
}
