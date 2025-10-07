import {
  User,
  UserId,
  Request,
  AuditLog,
  AuditEventType,
} from "@/external/domain";
import { ApprovalAction } from "./RequestApprovalService";
import { AuditLogRepository } from "@/external/repository/AuditLogRepository";

export class AuditService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  /**
   * Log request creation
   */
  async logRequestCreated(
    request: Request,
    context?: AuditContext
  ): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.REQUEST_CREATED,
      entityType: "REQUEST",
      entityId: request.getId().getValue(),
      actorId: request.getRequesterId().getValue(),
      description: `Request "${request.getTitle()}" created`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          title: request.getTitle(),
          type: request.getType(),
          priority: request.getPriority(),
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log request update
   */
  async logRequestUpdated(
    requestId: string,
    updater: User,
    changes: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    context?: AuditContext
  ): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.REQUEST_UPDATED,
      entityType: "REQUEST",
      entityId: requestId,
      actorId: updater.getId().getValue(),
      description: `Request updated by ${updater.getName()}`,
      changes: this.formatChanges(changes),
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {},
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log request cancellation
   */
  async logRequestCancelled(
    requestId: string,
    canceller: User,
    reason: string,
    context?: AuditContext
  ): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.REQUEST_CANCELLED,
      entityType: "REQUEST",
      entityId: requestId,
      actorId: canceller.getId().getValue(),
      description: `Request cancelled by ${canceller.getName()}`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: { reason },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log a generic action
   */
  async logAction(params: AuditActionParams): Promise<void> {
    const {
      action,
      entityType,
      entityId,
      userId,
      metadata,
      eventType,
      description,
      context,
    } = params;

    const auditLog = AuditLog.create({
      eventType: eventType ?? AuditEventType.SYSTEM_ERROR,
      entityType,
      entityId,
      actorId: userId,
      description: description ?? action,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          action,
          ...(metadata ?? {}),
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log approval action
   */
  async logApprovalAction(
    requestId: string,
    approver: User,
    action: ApprovalAction,
    comment?: string,
    context?: AuditContext
  ): Promise<void> {
    const eventType = this.mapApprovalActionToEventType(action);

    const auditLog = AuditLog.create({
      eventType,
      entityType: "REQUEST",
      entityId: requestId,
      actorId: approver.getId().getValue(),
      description: `Request ${action.toLowerCase()} by ${approver.getName()}`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          approvalAction: action,
          comment,
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log user login
   */
  async logUserLogin(user: User, context?: AuditContext): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.SYSTEM_LOGIN,
      entityType: "USER",
      entityId: user.getId().getValue(),
      actorId: user.getId().getValue(),
      description: `User ${user.getName()} logged in`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          loginTime: new Date().toISOString(),
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log user logout
   */
  async logUserLogout(user: User, context?: AuditContext): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.SYSTEM_LOGOUT,
      entityType: "USER",
      entityId: user.getId().getValue(),
      actorId: user.getId().getValue(),
      description: `User ${user.getName()} logged out`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          logoutTime: new Date().toISOString(),
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log data export
   */
  async logDataExport(
    user: User,
    exportType: string,
    filters: Record<string, unknown>,
    context?: AuditContext
  ): Promise<void> {
    const auditLog = AuditLog.create({
      eventType: AuditEventType.SYSTEM_ERROR, // Using SYSTEM_ERROR as there's no EXPORT event type
      entityType: "SYSTEM",
      entityId: `export_${exportType}`,
      actorId: user.getId().getValue(),
      description: `Data export performed by ${user.getName()}`,
      context: {
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        metadata: {
          exportType,
          filters,
          exportTime: new Date().toISOString(),
        },
      },
    });

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs for a resource
   */
  async getAuditLogsForResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByEntityId(resourceType, resourceId);
  }

  /**
   * Get audit logs for a user
   */
  async getAuditLogsForUser(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number
  ): Promise<AuditLog[]> {
    // Note: Current repository doesn't support date filtering in findByActorId
    // Would need to use findByFilter for full functionality
    if (startDate || endDate) {
      return this.auditLogRepository.findByFilter(
        {
          actorId: UserId.create(userId),
          startDate,
          endDate,
        },
        limit
      );
    }

    return this.auditLogRepository.findByActorId(UserId.create(userId), limit);
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(
    eventType: AuditEventType,
    startDate?: Date,
    endDate?: Date,
    limit?: number
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByFilter(
      {
        eventType,
        startDate,
        endDate,
      },
      limit
    );
  }

  /**
   * Map approval action to event type
   */
  private mapApprovalActionToEventType(action: ApprovalAction): AuditEventType {
    switch (action) {
      case ApprovalAction.APPROVED:
        return AuditEventType.REQUEST_APPROVED;
      case ApprovalAction.REJECTED:
        return AuditEventType.REQUEST_REJECTED;
      default:
        return AuditEventType.REQUEST_UPDATED;
    }
  }

  /**
   * Format changes for audit log
   */
  private formatChanges(
    changes: Record<string, unknown>
  ): Record<string, { old: unknown; new: unknown }> | undefined {
    const formattedChanges: Record<string, { old: unknown; new: unknown }> = {};

    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined) {
        // We don't have the old value, so we'll just track the new value
        formattedChanges[key] = {
          old: null,
          new: value,
        };
      }
    }

    return Object.keys(formattedChanges).length > 0
      ? formattedChanges
      : undefined;
  }
}

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

// Re-export enums for backward compatibility
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  CANCEL = "CANCEL",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  VIEW = "VIEW",
  EXPORT = "EXPORT",
}

export enum ResourceType {
  REQUEST = "REQUEST",
  USER = "USER",
  APPROVAL = "APPROVAL",
  NOTIFICATION = "NOTIFICATION",
  SYSTEM = "SYSTEM",
}

export interface AuditActionParams {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  metadata?: Record<string, unknown>;
  eventType?: AuditEventType;
  description?: string;
  context?: AuditContext;
}
