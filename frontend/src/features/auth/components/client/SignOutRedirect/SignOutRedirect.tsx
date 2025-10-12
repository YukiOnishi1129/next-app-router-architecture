'use client'

import { useEffect } from 'react'

import { useSignOut } from '@/features/auth/hooks/useSignOut'

import type { Route } from 'next'

type SignOutRedirectProps = {
  redirectTo?: Route
  message?: string
  previousEmail?: string
}

export const SignOutRedirect = ({
  redirectTo = '/login',
  message = 'Signing you out…',
  previousEmail,
}: SignOutRedirectProps) => {
  const { handleSignOut } = useSignOut()

  useEffect(() => {
    void handleSignOut(redirectTo, {
      previousEmail,
    })
  }, [handleSignOut, redirectTo, previousEmail])

  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Please wait</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </section>
  )
}
