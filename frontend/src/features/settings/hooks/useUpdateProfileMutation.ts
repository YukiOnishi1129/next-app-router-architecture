'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAccountProfileAction } from '@/external/handler/account/command.action'

import { settingsKeys } from '../queries/keys'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: Parameters<typeof updateAccountProfileAction>[0]
    ) => {
      const response = await updateAccountProfileAction(input)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to update profile')
      }
      return response
    },
    onSuccess: (response) => {
      if (response.account) {
        queryClient.setQueryData(settingsKeys.profile(), response.account)
      }
    },
  })
}
