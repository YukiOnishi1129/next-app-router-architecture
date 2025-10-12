import { useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useQueryClient } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'

import { setEmailChangePreviousEmailCookieAction } from '@/features/auth/actions/email-change.action'
import { deleteAuthCookiesAction } from '@/features/auth/actions/token.action'

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
