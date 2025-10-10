import Link from 'next/link'

import { LoginForm } from '@/features/auth/components/client/LoginForm'
import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

export async function LoginPageTemplate() {
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
