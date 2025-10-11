export type RequestAuditLogEntry = {
  id: string
  eventType: string
  description: string
  actorName: string
  createdAt: string
  metadata?: Record<string, unknown> | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
}

export type RequestNotificationEntry = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
  readAt?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
}
