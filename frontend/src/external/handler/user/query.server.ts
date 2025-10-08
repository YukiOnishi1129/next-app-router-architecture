import 'server-only'

import { ZodError } from 'zod'

import { listUsersSchema } from '@/external/dto/user'

import { userManagementService, mapUserToDto } from './shared'
import { getSessionServer } from '../auth/query.server'

import type {
  ListUsersInput,
  ListUsersResponse,
  GetUserResponse,
} from '@/external/dto/user'

export async function listUsersServer(
  data?: ListUsersInput
): Promise<ListUsersResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = listUsersSchema.parse(data ?? {})

    const currentUser = await userManagementService.findUserById(
      session.user.id
    )
    if (!currentUser || !currentUser.isAdmin()) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const { users, total, limit, offset } =
      await userManagementService.listUsers(validated)

    return {
      success: true,
      users: users.map(mapUserToDto),
      total,
      limit,
      offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list users',
    }
  }
}

export async function getUserServer(userId: string): Promise<GetUserResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const currentUser = await userManagementService.findUserById(
      session.user.id
    )
    if (!currentUser) {
      return { success: false, error: 'Current user not found' }
    }

    const isAdmin = currentUser.isAdmin()
    const isSelfView = userId === session.user.id

    if (!isSelfView && !isAdmin) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const user = await userManagementService.findUserById(userId)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      user: mapUserToDto(user),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    }
  }
}

export async function getCurrentUserServer(): Promise<GetUserResponse> {
  const session = await getSessionServer()
  if (!session.isAuthenticated || !session.user) {
    return { success: false, error: 'Unauthorized' }
  }

  return getUserServer(session.user.id)
}

export type {
  ListUsersInput,
  ListUsersResponse,
  GetUserResponse,
} from '@/external/dto/user'
