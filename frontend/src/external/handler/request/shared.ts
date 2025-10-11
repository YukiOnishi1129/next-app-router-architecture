import { AuditLog, Request } from '@/external/domain'
import { RequestRepository } from '@/external/repository'
import { AuditService } from '@/external/service/audit/AuditService'
import { AccountManagementService } from '@/external/service/auth/AccountManagementService'
import { NotificationService } from '@/external/service/notification/NotificationService'
import { RequestApprovalService } from '@/external/service/request/RequestApprovalService'
import { RequestWorkflowService } from '@/external/service/request/RequestWorkflowService'

import type { AuditLogDto } from '@/external/dto/audit'
import type { RequestDto } from '@/external/dto/request'

export const notificationService = new NotificationService()
export const auditService = new AuditService()

export const workflowService = new RequestWorkflowService(
  notificationService,
  auditService
)

export const approvalService = new RequestApprovalService(
  notificationService,
  auditService
)

export const accountManagementService = new AccountManagementService()
export const requestRepository = new RequestRepository()

export type { RequestDto } from '@/external/dto/request'
export type { AuditLogDto } from '@/external/dto/audit'

export function mapRequestToDto(
  request: Request,
  options?: {
    requesterName?: string | null
    assigneeName?: string | null
    reviewerName?: string | null
  }
): RequestDto {
  const json = request.toJSON()
  return {
    id: json.id,
    title: json.title,
    description: json.description,
    type: json.type,
    priority: json.priority,
    status: json.status,
    requesterId: json.requesterId,
    requesterName: options?.requesterName ?? null,
    assigneeId: json.assigneeId,
    assigneeName: options?.assigneeName ?? null,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    submittedAt: json.submittedAt,
    reviewedAt: json.reviewedAt,
    reviewerId: json.reviewerId,
    reviewerName: options?.reviewerName ?? null,
  }
}

export function mapAuditLogToDto(
  auditLog: AuditLog,
  options?: { actorName?: string | null }
): AuditLogDto {
  const context = auditLog.getContext()
  return {
    id: auditLog.getId().getValue(),
    eventType: auditLog.getEventType(),
    description: auditLog.getDescription(),
    actorId: auditLog.getActorId()?.getValue() ?? null,
    actorName: options?.actorName ?? null,
    createdAt: auditLog.getCreatedAt().toISOString(),
    metadata: context.getMetadata(),
    changes: auditLog.getChanges(),
    context: {
      ipAddress: context.getIpAddress(),
      userAgent: context.getAccountAgent(),
    },
  }
}
