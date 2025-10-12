import 'server-only'

import { redirect } from 'next/navigation'

import { getSessionServer } from '@/features/auth/servers/session.server'
import { refreshIdTokenServer } from '@/features/auth/servers/token.server'

const isAuthenticatedServer = async (): Promise<boolean> => {
  try {
    const session = await getSessionServer()
    if (!session?.user) return false
    return true
  } catch {
    return false
  }
}

export async function requireAuthServer() {
  if (!(await isAuthenticatedServer())) {
    redirect('/login')
  }
}

export async function redirectIfAuthenticatedServer() {
  if (await isAuthenticatedServer()) {
    redirect('/dashboard')
  }
}
