import Link from 'next/link'
import type { Route } from 'next'

import { confirmEmailVerificationServer } from '@/external/handler/auth/command.server'

type VerifyEmailPageTemplateProps = {
  oobCode?: string | null
  nextPath?: string | null
}

export async function VerifyEmailPageTemplate({
  oobCode,
  nextPath,
}: VerifyEmailPageTemplateProps) {
  if (!oobCode) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold">Verification link invalid</h1>
        <p className="text-muted-foreground text-sm">
          The verification link is missing or has already been used. Request a
          new verification email from the login screen.
        </p>
        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            Return to login
          </Link>
        </div>
      </section>
    )
  }

  const result = await confirmEmailVerificationServer(oobCode)

  if (!result.success) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold">Verification failed</h1>
        <p className="text-muted-foreground text-sm">
          {result.error ??
            'We could not verify your email address. Request a new link and try again.'}
        </p>
        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            Return to login
          </Link>
        </div>
      </section>
    )
  }

  const destination: Route =
    nextPath && nextPath.startsWith('/') ? (nextPath as Route) : '/login'

  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Email verified</h1>
      <p className="text-muted-foreground text-sm">
        Your email address has been verified successfully. You can sign in and
        start using the application.
      </p>
      <div className="flex justify-center pt-4">
        <Link
          href={destination}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors"
        >
          Continue
        </Link>
      </div>
    </section>
  )
}
