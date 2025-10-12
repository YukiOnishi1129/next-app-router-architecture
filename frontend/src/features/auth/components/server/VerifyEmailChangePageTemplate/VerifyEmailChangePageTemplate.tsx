import { redirect } from 'next/navigation'

import { SignOutRedirect } from '@/features/auth/components/client/SignOutRedirect'
import { getSessionServer } from '@/features/auth/servers/session.server'

type VerifyEmailChangePageTemplateProps = {
  oobCode?: string
}

export async function VerifyEmailChangePageTemplate({
  oobCode,
}: VerifyEmailChangePageTemplateProps) {
  // if (!oobCode) {
  //   redirect('/login?emailChange=missing-oob-code')
  // }
  console.log('oobCode', oobCode)

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
