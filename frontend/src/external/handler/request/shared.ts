import { RequestWorkflowService } from "@/external/service/RequestWorkflowService";
import { RequestApprovalService } from "@/external/service/RequestApprovalService";
import { NotificationService } from "@/external/service/NotificationService";
import { AuditService } from "@/external/service/AuditService";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import { Request } from "@/external/domain";
import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from "@/external/domain/request/request-status";
import { RequestRepository } from "@/external/repository/RequestRepository";

const notificationService = new NotificationService();
const auditService = new AuditService();

export const workflowService = new RequestWorkflowService(
  notificationService,
  auditService
);

export const approvalService = new RequestApprovalService(
  notificationService,
  auditService
);

export const userManagementService = new UserManagementService();
export const requestRepository = new RequestRepository();

export type RequestDto = {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  requesterId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewerId?: string | null;
};

export function mapRequestToDto(request: Request): RequestDto {
  const json = request.toJSON();
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
  };
}
