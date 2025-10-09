'use client'

import { useRouter } from 'next/navigation'

import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'

export type SignOutButtonPresenterProps = {
  onSignOut: () => void
  isSigningOut: boolean
}

export function useSignOutButton(): SignOutButtonPresenterProps {
  const router = useRouter()
  const logoutMutation = useLogoutMutation()

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace('/login')
      },
    })
  }

  return {
    onSignOut: handleSignOut,
    isSigningOut: logoutMutation.isPending,
  }
}
