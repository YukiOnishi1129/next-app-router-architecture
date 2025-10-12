import Link from 'next/link'

import { EmailChangeLoginCookieCleaner } from '@/features/auth/components/client/EmailChangeLoginCookieCleaner'
import { EmailChangeLoginForm } from '@/features/auth/components/client/EmailChangeLoginForm'
import { getEmailChangePreviousEmailCookieServer } from '@/features/auth/servers/email-change.server'
import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

type EmailChangeLoginPageTemplateProps = {
  verified?: boolean
}

export async function EmailChangeLoginPageTemplate(
  props: EmailChangeLoginPageTemplateProps
) {
  await redirectIfAuthenticatedServer()
  const previousEmail =
    (await getEmailChangePreviousEmailCookieServer()) ?? undefined

  return (
    <>
      <EmailChangeLoginCookieCleaner enabled={Boolean(previousEmail)} />
      <section className="space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">
            Sign in with your new email
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the email you used before the change and the newly verified
            email so we can link your account correctly.
          </p>
        </header>

        {props.verified ? (
          <p className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-center text-sm">
            Your email address was updated. Please sign in again with your new
            details.
          </p>
        ) : null}

        <EmailChangeLoginForm defaultPreviousEmail={previousEmail} />

        <p className="text-muted-foreground text-center text-sm">
          Need to use your original sign-in?{' '}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Go back to the standard login page
          </Link>
        </p>
      </section>
    </>
  )
}
