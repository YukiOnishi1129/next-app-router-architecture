import { User } from "@/external/domain/models/User";
import { Request } from "@/external/domain/models/Request";
import { ApprovalAction } from "@/external/domain/valueobjects/ApprovalAction";
import { AuditLogRepository } from "@/external/repository/AuditLogRepository";

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

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

export class AuditService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  /**
   * Log request creation
   */
  async logRequestCreated(
    request: Request,
    context?: AuditContext
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: request.requester.id,
      userName: request.requester.name,
      action: AuditAction.CREATE,
      resourceType: ResourceType.REQUEST,
      resourceId: request.id,
      details: {
        title: request.title,
        category: request.category,
        priority: request.priority,
      },
      ...this.extractContext(context),
    };

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log request update
   */
  async logRequestUpdated(
    requestId: string,
    updater: User,
    changes: Record<string, any>,
    context?: AuditContext
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: updater.id,
      userName: updater.name,
      action: AuditAction.UPDATE,
      resourceType: ResourceType.REQUEST,
      resourceId: requestId,
      details: {
        changes,
      },
      ...this.extractContext(context),
    };

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
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: canceller.id,
      userName: canceller.name,
      action: AuditAction.CANCEL,
      resourceType: ResourceType.REQUEST,
      resourceId: requestId,
      details: {
        reason,
      },
      ...this.extractContext(context),
    };

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
    const auditAction = this.mapApprovalAction(action);

    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: approver.id,
      userName: approver.name,
      action: auditAction,
      resourceType: ResourceType.APPROVAL,
      resourceId: requestId,
      details: {
        approvalAction: action,
        comment,
      },
      ...this.extractContext(context),
    };

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log user login
   */
  async logUserLogin(user: User, context?: AuditContext): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      action: AuditAction.LOGIN,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      details: {
        loginTime: new Date().toISOString(),
      },
      ...this.extractContext(context),
    };

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log user logout
   */
  async logUserLogout(user: User, context?: AuditContext): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      action: AuditAction.LOGOUT,
      resourceType: ResourceType.USER,
      resourceId: user.id,
      details: {
        logoutTime: new Date().toISOString(),
      },
      ...this.extractContext(context),
    };

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log data export
   */
  async logDataExport(
    user: User,
    exportType: string,
    filters: Record<string, any>,
    context?: AuditContext
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      action: AuditAction.EXPORT,
      resourceType: ResourceType.SYSTEM,
      resourceId: `export_${exportType}`,
      details: {
        exportType,
        filters,
        exportTime: new Date().toISOString(),
      },
      ...this.extractContext(context),
    };

    await this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs for a resource
   */
  async getAuditLogsForResource(
    resourceType: ResourceType,
    resourceId: string,
    limit?: number
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByResource(
      resourceType,
      resourceId,
      limit
    );
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
    return this.auditLogRepository.findByUser(
      userId,
      startDate,
      endDate,
      limit
    );
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(
    action: AuditAction,
    startDate?: Date,
    endDate?: Date,
    limit?: number
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.findByAction(
      action,
      startDate,
      endDate,
      limit
    );
  }

  /**
   * Map approval action to audit action
   */
  private mapApprovalAction(action: ApprovalAction): AuditAction {
    switch (action) {
      case ApprovalAction.APPROVED:
        return AuditAction.APPROVE;
      case ApprovalAction.REJECTED:
        return AuditAction.REJECT;
      default:
        return AuditAction.UPDATE;
    }
  }

  /**
   * Extract context information
   */
  private extractContext(
    context?: AuditContext
  ): Pick<AuditLog, "ipAddress" | "userAgent"> {
    if (!context) {
      return {};
    }

    return {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}
