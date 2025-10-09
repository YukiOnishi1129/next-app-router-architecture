'use client'

import { useMutation } from '@tanstack/react-query'

import { signOutAction } from '@/features/auth/actions/session.actions'

import type { DeleteSessionResponse } from '@/external/dto/auth'

export const useLogoutMutation = () => {
  return useMutation<DeleteSessionResponse, Error, void>({
    mutationFn: async () => {
      const result = await signOutAction()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to sign out')
      }
      return result
    },
  })
}
