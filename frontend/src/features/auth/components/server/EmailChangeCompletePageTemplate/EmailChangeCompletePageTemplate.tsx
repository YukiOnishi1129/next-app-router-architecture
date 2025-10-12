import Link from 'next/link'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'

export async function EmailChangeCompletePageTemplate() {
  await requireAuthServer()

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Email updated</h1>
      <p className="text-muted-foreground text-sm">
        You&apos;re now signed in with your new email address. All future
        notifications and approvals will be sent there.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/settings/profile/email"
          className="text-primary hover:underline"
        >
          Review email settings
        </Link>
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:underline"
        >
          Go to dashboard
        </Link>
      </div>
    </section>
  )
}
