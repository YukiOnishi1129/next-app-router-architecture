import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../client/db/client";
import { auditLogs } from "../client/db/schema";
import {
  AuditLogRepository as IAuditLogRepository,
  AuditLog,
  AuditLogId,
  AuditEventType,
  UserId,
  AuditLogFilter,
} from "../domain";

export class AuditLogRepository implements IAuditLogRepository {
  async findById(id: AuditLogId): Promise<AuditLog | null> {
    const result = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByFilter(
    filter: AuditLogFilter,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    const conditions = [];

    if (filter.eventType) {
      conditions.push(eq(auditLogs.action, filter.eventType));
    }

    if (filter.entityType) {
      conditions.push(eq(auditLogs.entityType, filter.entityType));
    }

    if (filter.entityId) {
      conditions.push(eq(auditLogs.entityId, filter.entityId));
    }

    if (filter.actorId) {
      conditions.push(eq(auditLogs.userId, filter.actorId.getValue()));
    }

    if (filter.startDate) {
      conditions.push(gte(auditLogs.createdAt, filter.startDate));
    }

    if (filter.endDate) {
      conditions.push(lte(auditLogs.createdAt, filter.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(auditLogs.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
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
      .orderBy(desc(auditLogs.createdAt));

    return result.map((row) => this.mapToDomainEntity(row));
  }

  async findByActorId(
    actorId: UserId,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]> {
    let query = db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, actorId.getValue()))
      .orderBy(desc(auditLogs.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async save(entity: AuditLog): Promise<void> {
    const context = entity.getContext();
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
      userId: entity.getActorId()?.getValue() || "system",
      createdAt: entity.getCreatedAt(),
    };

    await db.insert(auditLogs).values(data);
  }

  async delete(id: AuditLogId): Promise<void> {
    // Audit logs should not be deleted in most cases
    // This method is here to satisfy the interface
    throw new Error("Audit logs cannot be deleted");
  }

  private mapToDomainEntity(row: typeof auditLogs.$inferSelect): AuditLog {
    const metadata = (row.metadata || {}) as any;

    return AuditLog.restore({
      id: row.id,
      eventType: (metadata.eventType ||
        this.mapActionToEventType(row.action)) as AuditEventType,
      entityType: row.entityType,
      entityId: row.entityId,
      actorId: row.userId === "system" ? null : row.userId,
      description: metadata.description || "",
      changes: row.changes as Record<
        string,
        { old: unknown; new: unknown }
      > | null,
      context: {
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
        sessionId: metadata.sessionId || null,
        metadata: metadata,
      },
      createdAt: row.createdAt,
    });
  }

  private mapEventTypeToAction(eventType: AuditEventType): string {
    // Map domain event types to database action enum values
    const mapping: Record<string, string> = {
      USER_CREATED: "CREATE",
      USER_UPDATED: "UPDATE",
      USER_STATUS_CHANGED: "UPDATE",
      USER_ROLE_ASSIGNED: "UPDATE",
      USER_ROLE_REMOVED: "UPDATE",
      REQUEST_CREATED: "CREATE",
      REQUEST_UPDATED: "UPDATE",
      REQUEST_SUBMITTED: "SUBMIT",
      REQUEST_ASSIGNED: "UPDATE",
      REQUEST_STATUS_CHANGED: "UPDATE",
      REQUEST_APPROVED: "APPROVE",
      REQUEST_REJECTED: "REJECT",
      REQUEST_CANCELLED: "CANCEL",
      ATTACHMENT_UPLOADED: "CREATE",
      ATTACHMENT_DELETED: "DELETE",
      COMMENT_CREATED: "CREATE",
      COMMENT_EDITED: "UPDATE",
      COMMENT_DELETED: "DELETE",
      SYSTEM_LOGIN: "VIEW",
      SYSTEM_LOGOUT: "VIEW",
      SYSTEM_ERROR: "VIEW",
    };

    return mapping[eventType] || "VIEW";
  }

  private mapActionToEventType(action: string): string {
    // For simple cases, we'll need more context from metadata
    // This is a fallback mapping
    return `SYSTEM_${action}` as string;
  }
}
