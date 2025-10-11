export type AuditLogDto = {
  id: string
  eventType: string
  description: string
  actorId: string | null
  actorName: string | null
  createdAt: string
  metadata?: Record<string, unknown> | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
  context?: {
    ipAddress?: string | null
    userAgent?: string | null
  }
}
