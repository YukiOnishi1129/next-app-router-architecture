'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { signOut } from 'next-auth/react'

export function useSignOutFlow() {
  const router = useRouter()
  const [signOutMessage, setSignOutMessage] = useState(
    'Please wait while we sign you out and redirect you to the login page.'
  )

  const runSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false })
      setSignOutMessage('You have been signed out. Redirecting to login…')
    } finally {
      router.replace('/login')
    }
  }, [router])

  return { signOutMessage, runSignOut }
}
