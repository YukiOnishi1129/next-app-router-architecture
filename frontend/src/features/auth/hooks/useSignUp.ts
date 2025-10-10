import { useCallback } from 'react'

import { signIn } from 'next-auth/react'

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
        const result = await signIn('credentials', {
          redirect: false,
          name,
          email,
          password,
          action: 'signup',
        })
        if (result?.error) {
          throw new Error(result.error)
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
