import 'server-only'

import { ZodError } from 'zod'

import { listNotificationsSchema } from '@/external/dto/notification'

import {
  notificationService,
  userManagementService,
  mapNotificationToDto,
} from './shared'
import { getSessionServer } from '../auth/query.server'

import type {
  ListNotificationsInput,
  ListNotificationsResponse,
  GetNotificationPreferencesResponse,
} from '@/external/dto/notification'

export async function listNotificationsServer(
  data?: ListNotificationsInput
): Promise<ListNotificationsResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = listNotificationsSchema.parse(data ?? {})

    const result = await notificationService.getUserNotifications(
      session.user.id,
      {
        unreadOnly: validated.unreadOnly,
        limit: validated.limit,
        offset: validated.offset,
      }
    )

    return {
      success: true,
      notifications: result.notifications.map(mapNotificationToDto),
      total: result.total,
      unreadCount: result.unreadCount,
      limit: validated.limit,
      offset: validated.offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get notifications',
    }
  }
}

export async function getNotificationPreferencesServer(): Promise<GetNotificationPreferencesResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await userManagementService.findUserById(session.user.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const preferences = await notificationService.getUserPreferences(
      session.user.id
    )
    const typeSet = new Set(preferences.types)

    return {
      success: true,
      preferences: {
        emailNotifications: preferences.emailEnabled,
        inAppNotifications: preferences.inAppEnabled,
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to get notification preferences',
    }
  }
}

export type {
  ListNotificationsInput,
  ListNotificationsResponse,
  GetNotificationPreferencesResponse,
} from '@/external/dto/notification'
