import 'server-only'

import { cache } from 'react'

import { getSessionServer as getAuthSession } from '@/external/handler/auth/query.server'

import type { GetSessionResponse } from '@/external/dto/auth'

export const getSessionServer = cache(
  async (): Promise<GetSessionResponse | null> => {
    const session = await getAuthSession()

    if (!session.isAuthenticated || !session.user) {
      return null
    }

    return session
  }
)
