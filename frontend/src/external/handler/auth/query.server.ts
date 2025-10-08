import 'server-only'

import { cookies } from 'next/headers'

import { getSessionSchema } from '@/external/dto/auth'

import { authService, userManagementService } from './shared'

import type { GetSessionInput, GetSessionResponse } from '@/external/dto/auth'

export async function getSessionServer(
  data?: GetSessionInput
): Promise<GetSessionResponse> {
  try {
    const validated = getSessionSchema.parse(data ?? {})
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    const storedUserId = cookieStore.get('user-id')?.value

    if (!token || !storedUserId) {
      return { isAuthenticated: false }
    }

    const tokenInfo = await authService.verifyToken(token)
    if (!tokenInfo) {
      cookieStore.delete('auth-token')
      cookieStore.delete('user-id')
      return { isAuthenticated: false }
    }

    const user = await userManagementService.findUserById(storedUserId)
    if (!user) {
      return { isAuthenticated: false }
    }

    if (validated.userId && validated.userId !== user.getId().getValue()) {
      return { isAuthenticated: false }
    }

    return {
      user: userManagementService.toUserProfile(user),
      isAuthenticated: true,
    }
  } catch (error) {
    console.error('Session error:', error)
    return { isAuthenticated: false }
  }
}

export async function checkPermissionServer(
  permission: string
): Promise<boolean> {
  const session = await getSessionServer()
  if (!session.isAuthenticated || !session.user) {
    return false
  }

  const user = await userManagementService.findUserById(session.user.id)
  if (!user) {
    return false
  }

  return userManagementService.hasPermission(user, permission)
}

export type { GetSessionInput, GetSessionResponse } from '@/external/dto/auth'
