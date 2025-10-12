import Link from 'next/link'

import { ProfileEmailForm } from '@/features/settings/components/client/ProfileEmailForm'

import { Card } from '@/shared/components/ui/card'

import { getCurrentAccountServer } from '@/external/handler/account/query.server'

export async function ProfileEmailPageTemplate() {
  const result = await getCurrentAccountServer()
  if (!result.success || !result.account) {
    throw new Error(result.error ?? 'Failed to load profile')
  }

  const account = result.account

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Change email address</h1>
        <p className="text-muted-foreground text-sm">
          Use an email you monitor regularly. You may be asked to verify it
          before signing in again.
        </p>
        <Link
          href="/settings/profile"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to profile
        </Link>
      </div>

      <Card className="max-w-lg p-6">
        <ProfileEmailForm
          accountId={account.id}
          currentName={account.name}
          initialEmail={account.email}
        />
      </Card>
    </section>
  )
}
