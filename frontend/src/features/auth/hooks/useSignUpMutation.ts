'use client'

import { useMutation } from '@tanstack/react-query'

import { signUpAction } from '@/features/auth/actions/session.actions'

import type { CreateUserInput, CreateUserResponse } from '@/external/dto/auth'

export const useSignUpMutation = () => {
  return useMutation<CreateUserResponse, Error, CreateUserInput>({
    mutationFn: async (input) => {
      const result = await signUpAction(input)
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create account')
      }

      return result
    },
  })
}
