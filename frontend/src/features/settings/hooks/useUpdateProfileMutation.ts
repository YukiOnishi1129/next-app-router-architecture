'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAccountProfileAction } from '@/external/handler/account/command.action'

import { settingsKeys } from '../queries/keys'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAccountProfileAction,
    onSuccess: (response) => {
      if (response.success && response.account) {
        queryClient.setQueryData(settingsKeys.profile(), response.account)
      }
    },
  })
}
