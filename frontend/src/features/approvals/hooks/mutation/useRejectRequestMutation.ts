'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UseMutationOptions } from '@tanstack/react-query'

import { approvalKeys } from '@/features/approvals/queries/keys'
import { notificationKeys } from '@/features/notifications/queries/keys'
import { requestKeys } from '@/features/requests/queries/keys'

import { rejectRequestAction } from '@/external/handler/request/command.action'

type RejectVariables = {
  requestId: string
  reason: string
}

type RejectResult = { requestId: string }

export const useRejectRequestMutation = (
  options?: UseMutationOptions<RejectResult, Error, RejectVariables>
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
    mutationFn: async ({ requestId, reason }: RejectVariables) => {
      const result = await rejectRequestAction({ requestId, reason })
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to reject request')
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
