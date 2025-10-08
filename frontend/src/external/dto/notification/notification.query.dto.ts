import { z } from 'zod'

import type { NotificationDto } from './notification.dto'

export const listNotificationsSchema = z.object({
  unreadOnly: z.boolean().default(false),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export type ListNotificationsInput = z.input<typeof listNotificationsSchema>

export type ListNotificationsResponse = {
  success: boolean
  error?: string
  notifications?: NotificationDto[]
  total?: number
  unreadCount?: number
  limit?: number
  offset?: number
}

export type GetNotificationPreferencesResponse = {
  success: boolean
  error?: string
  preferences?: {
    emailNotifications: boolean
    inAppNotifications: boolean
    notificationTypes: Record<string, boolean>
  }
}
