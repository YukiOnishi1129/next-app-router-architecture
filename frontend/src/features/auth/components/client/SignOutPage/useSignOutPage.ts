'use client'

import { useEffect, useState } from 'react'

import { useSignOut } from '@/features/auth/hooks/useSignOut'

export type SignOutPagePresenterProps = {
  title: string
  description: string
  errorMessage?: string
}

export function useSignOutPage(): SignOutPagePresenterProps {
  const { handleSignOut } = useSignOut()
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    let isMounted = true

    void (async () => {
      try {
        await handleSignOut()
      } catch (error) {
        if (!isMounted) return
        console.error('Failed to sign out', error)
        setErrorMessage(
          'We ran into a problem signing you out. Please try again.'
        )
      }
    })()

    return () => {
      isMounted = false
    }
  }, [handleSignOut])

  return {
    title: 'Signing out…',
    description:
      'We are securely signing you out and redirecting you to the login page.',
    errorMessage,
  }
}
