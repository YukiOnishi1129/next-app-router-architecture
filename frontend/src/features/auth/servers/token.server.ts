import { cookies } from 'next/headers'
import 'server-only'

// import { decodeJwt } from 'jose'

import { AUTH_COOKIE_NAMES } from '@/features/auth/constants/cookie'

export const getRefreshTokenServer = async () => {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value
}

export const setRefreshTokenCookieServer = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // for thirty days
  })
}

// const getIdTokenServer = async () => {
//   const cookieStore = await cookies()
//   return cookieStore.get(AUTH_COOKIE_NAMES.ID_TOKEN)?.value
// }

export const setIdTokenCookieServer = async (token: string) => {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAMES.ID_TOKEN, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // for an hour
  })
}

export const deleteAuthCookiesServer = async () => {
  const cookieStore = await cookies()

  // Delete ID token cookie
  cookieStore.delete(AUTH_COOKIE_NAMES.ID_TOKEN)

  // Delete refresh token cookie
  cookieStore.delete(AUTH_COOKIE_NAMES.REFRESH_TOKEN)
}
