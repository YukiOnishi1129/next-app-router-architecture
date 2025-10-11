import type { AuditLogDto } from '@/external/dto/audit'
import type { NotificationDto } from '@/external/dto/notification'
import type {
  RequestAuditLogEntry,
  RequestNotificationEntry,
} from '@/features/requests/types'

export const mapAuditLogDtoToEntry = (
  dto: AuditLogDto
): RequestAuditLogEntry => ({
  id: dto.id,
  eventType: dto.eventType,
  description: dto.description,
  actorName: dto.actorName ?? 'System',
  createdAt: dto.createdAt,
  metadata: dto.metadata ?? null,
  changes: dto.changes ?? null,
})

export const mapNotificationDtoToEntry = (
  dto: NotificationDto
): RequestNotificationEntry => ({
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
