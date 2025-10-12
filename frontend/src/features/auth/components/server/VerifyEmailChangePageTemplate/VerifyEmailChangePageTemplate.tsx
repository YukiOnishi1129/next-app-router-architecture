import { redirect } from 'next/navigation'

import { SignOutRedirect } from '@/features/auth/components/client/SignOutRedirect'
import { getSessionServer } from '@/features/auth/servers/session.server'

export async function VerifyEmailChangePageTemplate() {
  const session = await getSessionServer()
  if (!session?.account) {
    redirect('/login')
  }

  return (
    <SignOutRedirect
      redirectTo="/auth/email-change-login?verified=1"
      message="Your email was updated. We are signing you out so you can log in with the new address."
      previousEmail={session.account.email}
    />
  )
}
