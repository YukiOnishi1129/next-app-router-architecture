import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'

import {
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
  updateNotificationPreferencesSchema,
} from '@/external/dto/notification'

import { notificationService, userManagementService } from './shared'

import type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  NotificationCommandResponse,
  UpdateNotificationPreferencesResponse,
  MarkAllNotificationsReadResponse,
} from '@/external/dto/notification'

export async function markNotificationReadServer(
  data: MarkNotificationReadInput
): Promise<NotificationCommandResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = markNotificationReadSchema.parse(data)

    await notificationService.markAsRead(
      validated.notificationId,
      session.account.id
    )

    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to mark notification',
    }
  }
}

export async function markAllNotificationsReadServer(
  data?: MarkAllNotificationsReadInput
): Promise<MarkAllNotificationsReadResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = markAllNotificationsReadSchema.parse(data ?? {})
    const count = await notificationService.markAllAsRead(
      session.account.id,
      validated.before
    )

    return { success: true, count }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to mark notifications',
    }
  }
}

export async function updateNotificationPreferencesServer(
  data: UpdateNotificationPreferencesInput
): Promise<UpdateNotificationPreferencesResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateNotificationPreferencesSchema.parse(data)

    const types: string[] = []
    if (validated.notificationTypes) {
      const typeMap = {
        requestCreated: 'request.created',
        requestUpdated: 'request.updated',
        requestApproved: 'request.approved',
        requestRejected: 'request.rejected',
        commentAdded: 'comment.added',
        assignmentChanged: 'assignment.changed',
      } as const

      for (const [key, enabled] of Object.entries(
        validated.notificationTypes
      )) {
        if (enabled) {
          types.push(typeMap[key as keyof typeof typeMap])
        }
      }
    }

    const updated = await notificationService.updateUserPreferences(
      session.account.id,
      {
        emailEnabled: validated.emailNotifications,
        inAppEnabled: validated.inAppNotifications,
        types: types.length > 0 ? types : undefined,
      }
    )

    const typeSet = new Set(updated.types)

    return {
      success: true,
      preferences: {
        emailNotifications: updated.emailEnabled,
        inAppNotifications: updated.inAppEnabled,
        notificationTypes: {
          requestCreated: typeSet.has('request.created'),
          requestUpdated: typeSet.has('request.updated'),
          requestApproved: typeSet.has('request.approved'),
          requestRejected: typeSet.has('request.rejected'),
          commentAdded: typeSet.has('comment.added'),
          assignmentChanged: typeSet.has('assignment.changed'),
        },
      },
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
          : 'Failed to update notification preferences',
    }
  }
}

export async function sendTestNotificationServer(
  userId: string
): Promise<NotificationCommandResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const currentUser = await userManagementService.findUserById(
      session.account.id
    )
    if (!currentUser || !currentUser.isAdmin()) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const targetUser = await userManagementService.findUserById(userId)
    if (!targetUser) {
      return { success: false, error: 'Target user not found' }
    }

    await notificationService.sendTestNotification(targetUser)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send test notification',
    }
  }
}

export type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  NotificationCommandResponse,
  UpdateNotificationPreferencesResponse,
  MarkAllNotificationsReadResponse,
} from '@/external/dto/notification'
