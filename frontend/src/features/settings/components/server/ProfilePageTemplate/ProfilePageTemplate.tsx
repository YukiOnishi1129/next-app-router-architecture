import Link from 'next/link'

import { Card } from '@/shared/components/ui/card'

import { getCurrentAccountServer } from '@/external/handler/account/query.server'

type ProfilePageTemplateProps = {
  updatedField?: 'name' | 'email'
}

const SUCCESS_MESSAGES: Record<'name' | 'email', string> = {
  name: 'Your name was updated successfully.',
  email:
    'Your email was updated. If prompted, complete the verification sent to the new address.',
}

export async function ProfilePageTemplate({
  updatedField,
}: ProfilePageTemplateProps) {
  const result = await getCurrentAccountServer()
  if (!result.success || !result.account) {
    throw new Error(result.error ?? 'Failed to load profile')
  }

  const account = result.account

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Review your personal details and update them when needed.
        </p>
        {updatedField ? (
          <div className="rounded-md border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            {SUCCESS_MESSAGES[updatedField]}
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex h-full flex-col justify-between p-6">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Full name</p>
            <p className="text-xl leading-tight font-medium">{account.name}</p>
          </div>
          <div className="pt-4">
            <Link
              href="/settings/profile/name"
              className="text-primary text-sm font-medium hover:underline"
            >
              Edit name →
            </Link>
          </div>
        </Card>

        <Card className="flex h-full flex-col justify-between p-6">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Email address</p>
            <p className="text-xl leading-tight font-medium">{account.email}</p>
          </div>
          <div className="pt-4">
            <Link
              href="/settings/profile/email"
              className="text-primary text-sm font-medium hover:underline"
            >
              Change email →
            </Link>
          </div>
        </Card>
      </div>
    </section>
  )
}
