'use client'

import type { SignOutPagePresenterProps } from './useSignOutPage'

export function SignOutPagePresenter({
  title,
  description,
  errorMessage,
}: SignOutPagePresenterProps) {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
      {errorMessage ? (
        <p className="text-destructive text-sm">{errorMessage}</p>
      ) : null}
    </section>
  )
}
