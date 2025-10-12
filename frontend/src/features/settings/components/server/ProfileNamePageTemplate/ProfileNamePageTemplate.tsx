import Link from 'next/link'

import { ProfileNameForm } from '@/features/settings/components/client/ProfileNameForm'

import { Card } from '@/shared/components/ui/card'

import { getCurrentAccountServer } from '@/external/handler/account/query.server'

export async function ProfileNamePageTemplate() {
  const result = await getCurrentAccountServer()
  if (!result.success || !result.account) {
    throw new Error(result.error ?? 'Failed to load profile')
  }

  const account = result.account

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Update your name</h1>
        <p className="text-muted-foreground text-sm">
          Set the name that appears across the workspace.
        </p>
        <Link
          href="/settings/profile"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to profile
        </Link>
      </div>

      <Card className="max-w-lg p-6">
        <ProfileNameForm
          accountId={account.id}
          initialName={account.name}
          currentEmail={account.email}
        />
      </Card>
    </section>
  )
}
