import 'server-only'

import { redirect } from 'next/navigation'

import { getSessionServer } from './session.server'

import type { GetSessionResponse } from '@/external/dto/auth'
import type { Route } from 'next'

export async function requireAuthServer(
  options: { redirectTo?: Route } = {}
): Promise<GetSessionResponse> {
  const session = await getSessionServer()
  if (!session) {
    redirect(options.redirectTo ?? '/login')
  }
  return session
}

export async function redirectIfAuthenticatedServer(
  options: { redirectTo?: Route } = {}
): Promise<GetSessionResponse | null> {
  const session = await getSessionServer()
  if (session) {
    redirect(options.redirectTo ?? '/requests')
  }
  return session
}
