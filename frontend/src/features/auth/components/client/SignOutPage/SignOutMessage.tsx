'use client'

import { useCallback, useEffect } from 'react'

import { useSignOut } from '@/features/auth/hooks/useSignOut'

export function SignOutMessage() {
  const { handleSignOut } = useSignOut()

  const runSignOut = useCallback(async () => {
    try {
      await handleSignOut()
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }, [handleSignOut])

  useEffect(() => {
    runSignOut()
  }, [runSignOut])

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Signing out…</h1>
      <p className="text-muted-foreground text-sm">
        We are securely signing you out and redirecting you to the login page.
      </p>
    </section>
  )
}
