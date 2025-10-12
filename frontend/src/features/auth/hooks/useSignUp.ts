import { useCallback } from 'react'

import { signUpAction } from '@/features/auth/actions/sign-up.action'

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
        const result = await signUpAction({
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
