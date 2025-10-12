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
        const errorMessage = response.error ?? 'Failed to update profile'
        if (errorMessage.includes('OPERATION_NOT_ALLOWED')) {
          throw new Error(
            'This email requires verification before it can be used. Check the inbox of the new address for a verification link.'
          )
        }
        throw new Error(errorMessage)
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
