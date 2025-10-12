import { useCallback } from 'react'

import { signIn } from 'next-auth/react'

import { CREDENTIAL_TYPE } from '@/features/auth/constants/credential'

export const useSignIn = () => {
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        action: CREDENTIAL_TYPE.LOGIN,
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
