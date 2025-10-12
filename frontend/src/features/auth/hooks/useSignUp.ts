import { useCallback } from 'react'

import { signUpCommandAction } from '@/external/handler/auth/command.action'

export const useSignUp = () => {
  const handleSignUp = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }) => {
      try {
        const result = await signUpCommandAction({
          name,
          email,
          password,
        })
        if (!result.success) {
          throw new Error(result.error ?? 'Failed to sign up')
        }
        return result
      } catch (error) {
        throw error
      }
    },
    []
  )

  return { handleSignUp }
}
