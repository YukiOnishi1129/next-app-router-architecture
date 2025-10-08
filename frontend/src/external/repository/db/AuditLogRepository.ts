import { eq, and, gte, lte, desc } from 'drizzle-orm'

import { db } from '@/external/client/db/client'
import { auditLogs } from '@/external/client/db/schema'
import {
  AuditLogRepository as IAuditLogRepository,
  AuditLog,
  AuditLogId,
  AuditEventType,
  UserId,
  AuditLogFilter,
  AuditAction,
} from '@/external/domain'

export class AuditLogRepository implements IAuditLogRepository {
  private applyPagination<
    T extends { limit: (value: number) => T; offset: (value: number) => T },
  >(query: T, limit?: number, offset?: number): T {
    let result = query

    if (limit !== undefined) {
      result = result.limit(limit)
    }

    if (offset !== undefined) {
      result = result.offset(offset)
    }

    return result
  }

  async findById(id: AuditLogId): Promise<AuditLog | null> {
    const result = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id.getValue()))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.mapToDomainEntity(result[0])
  }

  async findByFilter(
    filter: AuditLogFilter,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs).$dynamic()
    const whereClause = and(
      filter.eventType
        ? eq(auditLogs.action, this.mapEventTypeToAction(filter.eventType))
        : undefined,
      filter.entityType
        ? eq(auditLogs.entityType, filter.entityType)
        : undefined,
      filter.entityId ? eq(auditLogs.entityId, filter.entityId) : undefined,
      filter.actorId
        ? eq(auditLogs.userId, filter.actorId.getValue())
        : undefined,
      filter.startDate ? gte(auditLogs.createdAt, filter.startDate) : undefined,
      filter.endDate ? lte(auditLogs.createdAt, filter.endDate) : undefined
    )

    if (whereClause) {
      query = query.where(whereClause)
    }

    query = query.orderBy(desc(auditLogs.createdAt))

    const paginatedQuery = this.applyPagination(query, limit, offset)
    const result = await paginatedQuery
    return result.map((row) => this.mapToDomainEntity(row))
  }

  async findByEntityId(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    const result = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogs.createdAt))

    return result.map((row) => this.mapToDomainEntity(row))
  }

  async findByActorId(
    actorId: UserId,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]> {
    const baseQuery = db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, actorId.getValue()))
      .orderBy(desc(auditLogs.createdAt))
      .$dynamic()

    const query = this.applyPagination(baseQuery, limit, offset)
    const result = await query
    return result.map((row) => this.mapToDomainEntity(row))
  }

  async save(entity: AuditLog): Promise<void> {
    const context = entity.getContext()
    const data = {
      id: entity.getId().getValue(),
      entityType: entity.getEntityType(),
      entityId: entity.getEntityId(),
      action: this.mapEventTypeToAction(entity.getEventType()),
      changes: entity.getChanges(),
      metadata: {
        eventType: entity.getEventType(),
        description: entity.getDescription(),
        ipAddress: context.getIpAddress(),
        userAgent: context.getUserAgent(),
        sessionId: context.getSessionId(),
        ...context.getMetadata(),
      },
      userId: entity.getActorId()?.getValue() || 'system',
      createdAt: entity.getCreatedAt(),
    }

    await db.insert(auditLogs).values(data)
  }

  async delete(): Promise<void> {
    // Audit logs should not be deleted in most cases
    // This method is here to satisfy the interface
    throw new Error('Audit logs cannot be deleted')
  }

  private mapToDomainEntity(row: typeof auditLogs.$inferSelect): AuditLog {
    type MetadataPayload = {
      eventType?: AuditEventType
      description?: string
      ipAddress?: string | null
      userAgent?: string | null
      sessionId?: string | null
    } & Record<string, unknown>

    const metadata = (row.metadata ?? {}) as MetadataPayload

    return AuditLog.restore({
      id: row.id,
      eventType: metadata.eventType ?? this.mapActionToEventType(row.action),
      entityType: row.entityType,
      entityId: row.entityId,
      actorId: row.userId === 'system' ? null : row.userId,
      description: metadata.description ?? '',
      changes: row.changes as Record<
        string,
        { old: unknown; new: unknown }
      > | null,
      context: {
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
        sessionId: metadata.sessionId ?? null,
        metadata: metadata,
      },
      createdAt: row.createdAt,
    })
  }

  private mapEventTypeToAction(eventType: AuditEventType): AuditAction {
    switch (eventType) {
      case AuditEventType.USER_CREATED:
      case AuditEventType.REQUEST_CREATED:
      case AuditEventType.ATTACHMENT_UPLOADED:
      case AuditEventType.COMMENT_CREATED:
        return 'CREATE'
      case AuditEventType.USER_UPDATED:
      case AuditEventType.USER_STATUS_CHANGED:
      case AuditEventType.USER_ROLE_ASSIGNED:
      case AuditEventType.USER_ROLE_REMOVED:
      case AuditEventType.REQUEST_UPDATED:
      case AuditEventType.REQUEST_ASSIGNED:
      case AuditEventType.REQUEST_STATUS_CHANGED:
      case AuditEventType.COMMENT_EDITED:
        return 'UPDATE'
      case AuditEventType.ATTACHMENT_DELETED:
      case AuditEventType.COMMENT_DELETED:
        return 'DELETE'
      case AuditEventType.REQUEST_SUBMITTED:
        return 'SUBMIT'
      case AuditEventType.REQUEST_APPROVED:
        return 'APPROVE'
      case AuditEventType.REQUEST_REJECTED:
        return 'REJECT'
      case AuditEventType.REQUEST_CANCELLED:
        return 'CANCEL'
      case AuditEventType.SYSTEM_LOGIN:
      case AuditEventType.SYSTEM_LOGOUT:
      case AuditEventType.SYSTEM_ERROR:
      default:
        return 'VIEW'
    }
  }

  private mapActionToEventType(action: AuditAction): AuditEventType {
    switch (action) {
      case 'CREATE':
        return AuditEventType.REQUEST_CREATED
      case 'UPDATE':
        return AuditEventType.REQUEST_UPDATED
      case 'DELETE':
        return AuditEventType.COMMENT_DELETED
      case 'SUBMIT':
        return AuditEventType.REQUEST_SUBMITTED
      case 'APPROVE':
        return AuditEventType.REQUEST_APPROVED
      case 'REJECT':
        return AuditEventType.REQUEST_REJECTED
      case 'CANCEL':
        return AuditEventType.REQUEST_CANCELLED
      case 'VIEW':
      default:
        return AuditEventType.SYSTEM_ERROR
    }
  }
}
