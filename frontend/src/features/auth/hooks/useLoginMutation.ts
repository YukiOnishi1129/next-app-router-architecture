'use client'

import { useMutation } from '@tanstack/react-query'

import { signInAction } from '@/features/auth/actions/session.actions'

import type {
  CreateSessionResponse,
  CreateSessionInput,
} from '@/external/dto/auth'

export const useLoginMutation = () => {
  return useMutation<CreateSessionResponse, Error, CreateSessionInput>({
    mutationFn: async (input) => {
      const result = await signInAction(input)
      if (!result.success) {
        throw new Error(result.error ?? 'Authentication failed')
      }
      return result
    },
  })
}
