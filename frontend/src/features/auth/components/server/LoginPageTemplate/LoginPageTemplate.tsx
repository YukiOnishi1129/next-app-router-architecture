import Link from 'next/link'

import { LoginForm } from '@/features/auth/components/client/LoginForm'
import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

type LoginPageTemplateProps = {
  passwordUpdated?: boolean
}

export async function LoginPageTemplate({
  passwordUpdated = false,
}: LoginPageTemplateProps) {
  await redirectIfAuthenticatedServer()

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Access the request & approval workspace with your organization
          account.
        </p>
      </header>

      {passwordUpdated ? (
        <div className="rounded-md border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          Your password was updated successfully. Sign in with your new password
          to continue.
        </div>
      ) : null}

      <LoginForm />

      <p className="text-muted-foreground text-center text-sm">
        No account yet?{' '}
        <Link
          href="/signup"
          className="text-primary font-semibold hover:underline"
        >
          Create one now
        </Link>
      </p>
    </section>
  )
}
