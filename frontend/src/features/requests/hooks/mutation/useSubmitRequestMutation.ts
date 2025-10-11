'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { submitRequestAction } from '@/features/requests/actions'
import { requestKeys } from '@/features/requests/queries/keys'

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
      ])
    },
  })
}
