import { z } from 'zod'

export const markNotificationReadSchema = z.object({
  notificationId: z.string(),
})

export const markAllNotificationsReadSchema = z.object({
  before: z.date().optional(),
})

export const updateNotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  notificationTypes: z
    .object({
      requestCreated: z.boolean().optional(),
      requestUpdated: z.boolean().optional(),
      requestApproved: z.boolean().optional(),
      requestRejected: z.boolean().optional(),
      commentAdded: z.boolean().optional(),
      assignmentChanged: z.boolean().optional(),
    })
    .optional(),
})

export type MarkNotificationReadInput = z.input<
  typeof markNotificationReadSchema
>
export type MarkAllNotificationsReadInput = z.input<
  typeof markAllNotificationsReadSchema
>
export type UpdateNotificationPreferencesInput = z.input<
  typeof updateNotificationPreferencesSchema
>

export type NotificationCommandResponse = {
  success: boolean
  error?: string
}

export type UpdateNotificationPreferencesResponse = {
  success: boolean
  error?: string
  preferences?: {
    emailNotifications: boolean
    inAppNotifications: boolean
    notificationTypes: Record<string, boolean>
  }
}

export type MarkAllNotificationsReadResponse = NotificationCommandResponse & {
  count?: number
}
