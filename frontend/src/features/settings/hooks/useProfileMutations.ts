'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  requestAccountEmailChangeAction,
  updateAccountNameAction,
} from '@/external/handler/account/command.action'

import { settingsKeys } from '../queries/keys'

export const useUpdateProfileNameMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Parameters<typeof updateAccountNameAction>[0]) => {
      const response = await updateAccountNameAction(input)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to update profile name')
      }
      return response
    },
    onSuccess: (response) => {
      if (response.success && response.account) {
        queryClient.setQueryData(settingsKeys.profile(), response.account)
      }
    },
  })
}

export const useRequestEmailChangeMutation = () => {
  return useMutation({
    mutationFn: async (
      input: Parameters<typeof requestAccountEmailChangeAction>[0]
    ) => {
      const response = await requestAccountEmailChangeAction(input)
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to request email change')
      }
      return response
    },
  })
}
