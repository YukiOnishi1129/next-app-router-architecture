import Link from 'next/link'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'

export async function EmailChangeRequestedPageTemplate() {
  await requireAuthServer()

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Check your inbox</h1>
      <p className="text-muted-foreground text-sm">
        We sent a confirmation email to your new address. Follow the link inside
        to finish updating your account. You&apos;ll be asked to sign in again
        with the new email once it&apos;s verified.
      </p>
      <div className="border-border/60 bg-muted/30 text-muted-foreground rounded-md border border-dashed p-5 text-sm">
        <p className="text-foreground font-medium">Haven&apos;t received it?</p>
        <ul className="list-disc space-y-2 pt-2 pl-5 text-left">
          <li>Check your spam or junk folder.</li>
          <li>Resend the request from your profile if the link expires.</li>
        </ul>
      </div>
      <div className="flex justify-center gap-3">
        <Link
          href="/settings/profile/email"
          className="text-primary hover:underline"
        >
          Back to email settings
        </Link>
      </div>
    </section>
  )
}
