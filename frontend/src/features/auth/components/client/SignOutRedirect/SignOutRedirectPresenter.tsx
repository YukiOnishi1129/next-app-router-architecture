'use client'

import type { SignOutRedirectPresenterProps } from './useSignOutRedirect'

export function SignOutRedirectPresenter({
  message,
}: SignOutRedirectPresenterProps) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Please wait</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
    </section>
  )
}
