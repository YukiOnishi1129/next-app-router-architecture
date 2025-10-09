import { useCallback } from 'react'

import { signOut } from 'next-auth/react'

import { deleteAuthCookiesAction } from '@/features/auth/actions/token.action'

import { redirectAction } from '@/shared/actions/redirect.action'

export const useSignOut = () => {
  const handleSignOut = useCallback(async () => {
    await deleteAuthCookiesAction()
    await signOut({ redirect: false })
    await redirectAction('/login')
  }, [])

  return { handleSignOut }
}
