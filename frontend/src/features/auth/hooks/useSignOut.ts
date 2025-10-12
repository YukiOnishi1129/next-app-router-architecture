import { useCallback } from 'react'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { useQueryClient } from '@tanstack/react-query'

import { deleteAuthCookiesAction } from '@/features/auth/actions/token.action'
import { setEmailChangePreviousEmailCookieAction } from '@/features/auth/actions/email-change.action'

import type { Route } from 'next'

type UseSignOutOptions = {
  previousEmail?: string
}

export const useSignOut = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = useCallback(
    async (redirectTo: Route = '/login', options?: UseSignOutOptions) => {
      queryClient.clear()

      if (options?.previousEmail) {
        await setEmailChangePreviousEmailCookieAction(options.previousEmail)
      }

      await deleteAuthCookiesAction()
      await signOut({ redirect: false })
      router.replace(redirectTo)
      router.refresh()
    },
    [queryClient, router]
  )

  return { handleSignOut }
}
