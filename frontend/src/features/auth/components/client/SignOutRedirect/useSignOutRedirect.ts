'use client'

import { useEffect } from 'react'

import { useSignOut } from '@/features/auth/hooks/useSignOut'

import type { Route } from 'next'

type UseSignOutRedirectArgs = {
  redirectTo?: Route
  message?: string
  previousEmail?: string
}

export type SignOutRedirectPresenterProps = {
  message: string
}

export function useSignOutRedirect({
  redirectTo = '/login',
  message = 'Signing you out…',
  previousEmail,
}: UseSignOutRedirectArgs): SignOutRedirectPresenterProps {
  const { handleSignOut } = useSignOut()

  useEffect(() => {
    void handleSignOut(redirectTo, {
      previousEmail,
    })
  }, [handleSignOut, redirectTo, previousEmail])

  return { message }
}
