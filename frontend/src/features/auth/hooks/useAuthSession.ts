'use client'

import { useSession } from 'next-auth/react'

export function useAuthSession() {
  const { data: session, status, update } = useSession()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    update,
  }
}
