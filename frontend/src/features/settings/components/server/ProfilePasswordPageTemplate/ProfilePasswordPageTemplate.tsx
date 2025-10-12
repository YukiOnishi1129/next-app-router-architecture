import Link from 'next/link'

import { ProfilePasswordForm } from '@/features/settings/components/client/ProfilePasswordForm'

import { Card } from '@/shared/components/ui/card'

import { getSessionServer } from '@/features/auth/servers/session.server'

export async function ProfilePasswordPageTemplate() {
  const session = await getSessionServer()
  if (!session?.account) {
    throw new Error('Unauthorized')
  }

  const accountId = session.account.id

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Update your password</h1>
        <p className="text-muted-foreground text-sm">
          Choose a strong password to keep your workspace account secure. After
          saving, you&apos;ll be signed out and need to sign in again.
        </p>
        <Link
          href="/settings/profile"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to profile
        </Link>
      </div>

      <Card className="max-w-lg p-6">
        <ProfilePasswordForm accountId={accountId} />
      </Card>
    </section>
  )
}
