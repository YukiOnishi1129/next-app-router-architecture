import { Notification } from '@/external/domain/notification/notification'
import { AccountManagementService } from '@/external/service/auth/AccountManagementService'
import { NotificationService } from '@/external/service/notification/NotificationService'

import type { NotificationDto } from '@/external/dto/notification'

export const notificationService = new NotificationService()
export const accountManagementService = new AccountManagementService()

export type { NotificationDto } from '@/external/dto/notification'

export function mapNotificationToDto(
  notification: Notification
): NotificationDto {
  const json = notification.toJSON()
  return {
    id: json.id,
    accountId: json.recipientId,
    type: json.type,
    title: json.title,
    message: json.message,
    read: json.isRead,
    createdAt: json.createdAt,
    readAt: json.readAt,
    relatedEntityType: json.relatedEntityType,
    relatedEntityId: json.relatedEntityId,
  }
}
