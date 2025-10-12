import { cookies } from 'next/headers'
import 'server-only'

const PREVIOUS_EMAIL_COOKIE = 'email-change.previous-email'
const COOKIE_MAX_AGE = 60 * 5 // 5 minutes

export const setEmailChangePreviousEmailCookieServer = async (
  email: string
) => {
  if (!email) return
  const cookieStore = await cookies()
  cookieStore.set(PREVIOUS_EMAIL_COOKIE, email, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export const getEmailChangePreviousEmailCookieServer = async () => {
  const cookieStore = await cookies()
  return cookieStore.get(PREVIOUS_EMAIL_COOKIE)?.value
}

export const deleteEmailChangePreviousEmailCookieServer = async () => {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIOUS_EMAIL_COOKIE)
}
