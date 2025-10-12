import { cookies } from 'next/headers'
import 'server-only'

import { deleteAuthCookiesServer } from '@/features/auth/servers/token.server'

const NEXT_AUTH_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
]

export const signOutServer = async () => {
  const cookieStore = await cookies()

  NEXT_AUTH_COOKIE_NAMES.forEach((cookieName) => {
    cookieStore.delete(cookieName)
  })

  await deleteAuthCookiesServer()
}
