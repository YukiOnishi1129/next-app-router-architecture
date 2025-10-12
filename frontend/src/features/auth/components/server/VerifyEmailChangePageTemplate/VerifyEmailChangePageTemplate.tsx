import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getSessionServer } from '@/features/auth/servers/session.server'

import { confirmEmailChangeServer } from '@/external/handler/account/command.server'

type VerifyEmailChangePageTemplateProps = {
  oobCode?: string | null
}

export async function VerifyEmailChangePageTemplate({
  oobCode,
}: VerifyEmailChangePageTemplateProps) {
  if (!oobCode) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold">Email change link invalid</h1>
        <p className="text-muted-foreground text-sm">
          The link is missing required information or has already been used.
          Request a new email change from your profile settings or contact an
          administrator.
        </p>
        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            Return to login
          </Link>
        </div>
      </section>
    )
  }

  const session = await getSessionServer()
  if (!session?.account) {
    redirect('/login')
  }

  const result = await confirmEmailChangeServer({
    accountId: session.account.id,
    oobCode,
  })

  if (!result.success || !result.account) {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold">Email change failed</h1>
        <p className="text-muted-foreground text-sm">
          {result.error ??
            'We could not update your email address. Request a new link and try again.'}
        </p>
        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
          >
            Return to login
          </Link>
        </div>
      </section>
    )
  }

  redirect('/signout')
}
