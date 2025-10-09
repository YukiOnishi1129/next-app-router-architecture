import Link from 'next/link'

import { SignUpForm } from '@/features/auth/components/client/SignUpForm/SignUpForm'
import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

export async function SignUpPageTemplate() {
  await redirectIfAuthenticatedServer()

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">
          Create your workspace account
        </h1>
        <p className="text-muted-foreground text-sm">
          Join your team to submit requests, track approvals, and manage your
          profile.
        </p>
      </header>

      <SignUpForm />

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  )
}
