import { UserId } from "../user";
import { AuditLogId } from "./audit-log-id";

/**
 * Audit event types
 */
export enum AuditEventType {
  // User events
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_STATUS_CHANGED = "USER_STATUS_CHANGED",
  USER_ROLE_ASSIGNED = "USER_ROLE_ASSIGNED",
  USER_ROLE_REMOVED = "USER_ROLE_REMOVED",

  // Request events
  REQUEST_CREATED = "REQUEST_CREATED",
  REQUEST_UPDATED = "REQUEST_UPDATED",
  REQUEST_SUBMITTED = "REQUEST_SUBMITTED",
  REQUEST_ASSIGNED = "REQUEST_ASSIGNED",
  REQUEST_STATUS_CHANGED = "REQUEST_STATUS_CHANGED",
  REQUEST_APPROVED = "REQUEST_APPROVED",
  REQUEST_REJECTED = "REQUEST_REJECTED",
  REQUEST_CANCELLED = "REQUEST_CANCELLED",

  // Attachment events
  ATTACHMENT_UPLOADED = "ATTACHMENT_UPLOADED",
  ATTACHMENT_DELETED = "ATTACHMENT_DELETED",

  // Comment events
  COMMENT_CREATED = "COMMENT_CREATED",
  COMMENT_EDITED = "COMMENT_EDITED",
  COMMENT_DELETED = "COMMENT_DELETED",

  // System events
  SYSTEM_LOGIN = "SYSTEM_LOGIN",
  SYSTEM_LOGOUT = "SYSTEM_LOGOUT",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}

/**
 * Audit context - contains additional information about the audit event
 */
export class AuditContext {
  constructor(
    private readonly ipAddress: string | null,
    private readonly userAgent: string | null,
    private readonly sessionId: string | null,
    private readonly metadata: Record<string, unknown>
  ) {}

  getIpAddress(): string | null {
    return this.ipAddress;
  }

  getUserAgent(): string | null {
    return this.userAgent;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getMetadata(): Record<string, unknown> {
    return { ...this.metadata };
  }
}

/**
 * AuditLog entity - represents a system audit log entry
 */
export class AuditLog {
  private constructor(
    private readonly id: AuditLogId,
    private readonly eventType: AuditEventType,
    private readonly entityType: string,
    private readonly entityId: string,
    private readonly actorId: UserId | null,
    private readonly description: string,
    private readonly changes: Record<
      string,
      { old: unknown; new: unknown }
    > | null,
    private readonly context: AuditContext,
    private readonly createdAt: Date
  ) {}

  static create(params: {
    eventType: AuditEventType;
    entityType: string;
    entityId: string;
    actorId: string | null;
    description: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
    context?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      metadata?: Record<string, unknown>;
    };
  }): AuditLog {
    return new AuditLog(
      AuditLogId.generate(),
      params.eventType,
      params.entityType,
      params.entityId,
      params.actorId ? UserId.create(params.actorId) : null,
      params.description,
      params.changes || null,
      new AuditContext(
        params.context?.ipAddress || null,
        params.context?.userAgent || null,
        params.context?.sessionId || null,
        params.context?.metadata || {}
      ),
      new Date()
    );
  }

  static restore(params: {
    id: string;
    eventType: AuditEventType;
    entityType: string;
    entityId: string;
    actorId: string | null;
    description: string;
    changes: Record<string, { old: unknown; new: unknown }> | null;
    context: {
      ipAddress: string | null;
      userAgent: string | null;
      sessionId: string | null;
      metadata: Record<string, unknown>;
    };
    createdAt: Date;
  }): AuditLog {
    return new AuditLog(
      AuditLogId.create(params.id),
      params.eventType,
      params.entityType,
      params.entityId,
      params.actorId ? UserId.create(params.actorId) : null,
      params.description,
      params.changes,
      new AuditContext(
        params.context.ipAddress,
        params.context.userAgent,
        params.context.sessionId,
        params.context.metadata
      ),
      params.createdAt
    );
  }

  getId(): AuditLogId {
    return this.id;
  }

  getEventType(): AuditEventType {
    return this.eventType;
  }

  getEntityType(): string {
    return this.entityType;
  }

  getEntityId(): string {
    return this.entityId;
  }

  getActorId(): UserId | null {
    return this.actorId;
  }

  getDescription(): string {
    return this.description;
  }

  getChanges(): Record<string, { old: unknown; new: unknown }> | null {
    return this.changes ? { ...this.changes } : null;
  }

  getContext(): AuditContext {
    return this.context;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  isSystemEvent(): boolean {
    return this.actorId === null;
  }

  isUserEvent(): boolean {
    return this.eventType.toString().startsWith("USER_");
  }

  isRequestEvent(): boolean {
    return this.eventType.toString().startsWith("REQUEST_");
  }

  hasChanges(): boolean {
    return this.changes !== null && Object.keys(this.changes).length > 0;
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      eventType: this.eventType,
      entityType: this.entityType,
      entityId: this.entityId,
      actorId: this.actorId?.getValue() || null,
      description: this.description,
      changes: this.changes,
      context: {
        ipAddress: this.context.getIpAddress(),
        userAgent: this.context.getUserAgent(),
        sessionId: this.context.getSessionId(),
        metadata: this.context.getMetadata(),
      },
      createdAt: this.createdAt.toISOString(),
    };
  }
}
