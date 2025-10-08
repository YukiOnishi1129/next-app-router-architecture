import { Request } from '@/external/domain'
import { RequestRepository } from '@/external/repository'
import { AuditService } from '@/external/service/audit/AuditService'
import { UserManagementService } from '@/external/service/auth/UserManagementService'
import { NotificationService } from '@/external/service/notification/NotificationService'
import { RequestApprovalService } from '@/external/service/request/RequestApprovalService'
import { RequestWorkflowService } from '@/external/service/request/RequestWorkflowService'

import type { RequestDto } from '@/external/dto/request'

const notificationService = new NotificationService()
const auditService = new AuditService()

export const workflowService = new RequestWorkflowService(
  notificationService,
  auditService
)

export const approvalService = new RequestApprovalService(
  notificationService,
  auditService
)

export const userManagementService = new UserManagementService()
export const requestRepository = new RequestRepository()

export type { RequestDto } from '@/external/dto/request'

export function mapRequestToDto(request: Request): RequestDto {
  const json = request.toJSON()
  return {
    id: json.id,
    title: json.title,
    description: json.description,
    type: json.type,
    priority: json.priority,
    status: json.status,
    requesterId: json.requesterId,
    assigneeId: json.assigneeId,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
    submittedAt: json.submittedAt,
    reviewedAt: json.reviewedAt,
    reviewerId: json.reviewerId,
  }
}
