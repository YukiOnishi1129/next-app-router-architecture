import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'

import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  updateUserProfileSchema,
} from '@/external/dto/user'

import {
  auditService,
  userManagementService,
  SERVER_AUDIT_CONTEXT,
  AuditEventType,
  mapUserToDto,
} from './shared'

import type {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
  UpdateUserResponse,
} from '@/external/dto/user'

async function ensureAdmin(sessionUserId: string) {
  const currentUser = await userManagementService.findUserById(sessionUserId)
  if (!currentUser || !currentUser.isAdmin()) {
    throw new Error('Insufficient permissions')
  }
  return currentUser
}

export async function updateUserRoleServer(
  data: UpdateUserRoleInput
): Promise<UpdateUserResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateUserRoleSchema.parse(data)
    // const currentUser = await ensureAdmin(session.account.id)

    if (validated.userId === session.account.id) {
      return { success: false, error: 'Cannot change your own role' }
    }

    const targetUser = await userManagementService.findUserById(
      validated.userId
    )
    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    const previousRoles = targetUser.getRoles()
    const updatedUser = await userManagementService.updateUserRoles(
      validated.userId,
      [validated.role]
    )

    await auditService.logAction({
      action: 'user.role.update',
      entityType: 'USER',
      entityId: validated.userId,
      userId: session.account.id,
      metadata: {
        previousRoles,
        newRoles: updatedUser.getRoles(),
      },
      eventType: AuditEventType.USER_ROLE_ASSIGNED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      user: mapUserToDto(updatedUser),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user role',
    }
  }
}

export async function updateUserStatusServer(
  data: UpdateUserStatusInput
): Promise<UpdateUserResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateUserStatusSchema.parse(data)
    await ensureAdmin(session.account.id)

    if (validated.userId === session.account.id) {
      return { success: false, error: 'Cannot change your own status' }
    }

    const targetUser = await userManagementService.findUserById(
      validated.userId
    )
    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    const previousStatus = targetUser.getStatus()
    const updatedUser = await userManagementService.updateUserStatus(
      validated.userId,
      validated.status
    )

    await auditService.logAction({
      action: 'user.status.change',
      entityType: 'USER',
      entityId: validated.userId,
      userId: session.account.id,
      metadata: {
        previousStatus,
        newStatus: validated.status,
      },
      eventType: AuditEventType.USER_STATUS_CHANGED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      user: mapUserToDto(updatedUser),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user status',
    }
  }
}

export async function updateUserProfileServer(
  data: UpdateUserProfileInput
): Promise<UpdateUserResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateUserProfileSchema.parse(data)

    const currentUser = await userManagementService.findUserById(
      session.account.id
    )
    if (!currentUser) {
      return { success: false, error: 'Current user not found' }
    }

    const isAdmin = currentUser.isAdmin()
    const isSelfUpdate = validated.userId === session.account.id

    if (!isSelfUpdate && !isAdmin) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const targetUser = await userManagementService.findUserById(
      validated.userId
    )
    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    const updatedUser = await userManagementService.updateUserProfile(
      validated.userId,
      validated.name,
      validated.email
    )

    await auditService.logAction({
      action: 'user.profile.update',
      entityType: 'USER',
      entityId: validated.userId,
      userId: session.account.id,
      metadata: {
        updatedFields: [
          targetUser.getName() !== validated.name ? 'name' : undefined,
          targetUser.getEmail().getValue() !== validated.email
            ? 'email'
            : undefined,
        ].filter(Boolean),
        isSelfUpdate,
      },
      eventType: AuditEventType.USER_UPDATED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      user: mapUserToDto(updatedUser),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user profile',
    }
  }
}

export type {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
  UpdateUserResponse,
} from '@/external/dto/user'
