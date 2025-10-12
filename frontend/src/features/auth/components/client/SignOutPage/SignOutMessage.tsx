'use client'

import { useEffect } from 'react'

import { useSignOutFlow } from './useSignOutFlow'

export function SignOutMessage() {
  const { signOutMessage, runSignOut } = useSignOutFlow()

  useEffect(() => {
    runSignOut()
  }, [runSignOut])

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Signing out…</h1>
      <p className="text-muted-foreground text-sm">{signOutMessage}</p>
    </section>
  )
}
