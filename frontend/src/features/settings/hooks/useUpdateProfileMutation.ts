'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateUserProfileAction } from '@/external/handler/user/command.action'

import { settingsKeys } from '../queries/keys'

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserProfileAction,
    onSuccess: (response) => {
      if (response.success && response.user) {
        queryClient.setQueryData(settingsKeys.profile(), response.user)
      }
    },
  })
}
