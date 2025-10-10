import 'server-only'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/features/auth/lib/option'

export const getSessionServer = async () => {
  const session = await getServerSession(authOptions)
  return session
}
