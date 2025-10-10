import { cookies } from 'next/headers'
import 'server-only'

import { decodeJwt } from 'jose'

import { AUTH_COOKIE_NAMES } from '@/features/auth/constants/cookie'

import { refreshIdTokenCommandServer } from '@/external/handler/auth/token.server'

const SKEW = 60 // 60 seconds buffer for clock skew and network latency

export const refreshIdTokenServer = async () => {
  const idt = await getIdTokenServer()
  if (idt) {
    const { exp } = decodeJwt(idt) as { exp?: number }
    const now = Math.floor(Date.now() / 1000)
    // Check if token has more than 60 seconds until expiration
    // This prevents using a token that might expire during processing
    if (exp && exp > now + SKEW) return idt
  }
  const rt = await getRefreshTokenServer()
  if (!rt) throw new Error('unauthorized')

  const data = await refreshIdTokenCommandServer({ refreshToken: rt })

  if (!data.success || !data.idToken) {
    throw new Error('unauthorized')
  }

  await setIdTokenCookieServer(data.idToken)

  if (data.refreshToken) {
    await setRefreshTokenCookieServer(data.refreshToken)
  }

  return data.idToken
}

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

const getIdTokenServer = async () => {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAMES.ID_TOKEN)?.value
}

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
