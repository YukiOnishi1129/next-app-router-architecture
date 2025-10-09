import { useCallback } from 'react'

import { signIn } from 'next-auth/react'

export const useSignIn = () => {
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        action: 'login',
      })
      if (result?.error) {
        throw new Error(result.error)
      }
      return result
    } catch (error) {
      throw error
    }
  }, [])

  return { handleSignIn }
}
