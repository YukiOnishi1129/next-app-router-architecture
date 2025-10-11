import type { NotificationDto } from '@/external/dto/notification'
import type { NotificationItem } from '@/features/notifications/types'

export const mapNotificationDto = (dto: NotificationDto): NotificationItem => ({
  id: dto.id,
  title: dto.title,
  message: dto.message,
  type: dto.type,
  createdAt: dto.createdAt,
  read: dto.read,
  readAt: dto.readAt ?? null,
  relatedEntityType: dto.relatedEntityType ?? null,
  relatedEntityId: dto.relatedEntityId ?? null,
})
