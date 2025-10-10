'use client'

import { useCallback, useTransition } from 'react'

import { useSignOut } from '@/features/auth/hooks/useSignOut'

export type SignOutButtonPresenterProps = {
  onSignOut: () => void
  isSigningOut: boolean
}

export function useSignOutButton(): SignOutButtonPresenterProps {
  const [isPending, startTransition] = useTransition()
  const { handleSignOut } = useSignOut()

  const handleLogout = useCallback(() => {
    startTransition(async () => {
      await handleSignOut()
    })
  }, [handleSignOut])

  return {
    onSignOut: handleLogout,
    isSigningOut: isPending,
  }
}
