import { useCallback } from 'react'

import { signOut } from 'next-auth/react'

import { deleteAuthCookiesAction } from '@/features/auth/actions/token.action'

import { redirectAction } from '@/shared/actions/redirect.action'
import { getQueryClient } from '@/shared/lib/query-client'

export const useSignOut = () => {
  const handleSignOut = useCallback(async () => {
    const queryClient = getQueryClient()
    await deleteAuthCookiesAction()
    queryClient.clear()
    await signOut({ redirect: false })
    await redirectAction('/login')
  }, [])

  return { handleSignOut }
}
