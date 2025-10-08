import { db } from "@/external/client/db/client";
import {
  Request,
  RequestId,
  RequestStatus,
  User,
  UserId,
  AuditLog,
} from "@/external/domain";
import {
  RequestRepository,
  UserRepository,
  NotificationRepository,
  AuditLogRepository,
} from "@/external/repository";

import { AuditService } from "../audit/AuditService";
import { NotificationService } from "../notification/NotificationService";

// Define ApprovalAction enum since it doesn't exist in the domain
export enum ApprovalAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_INFO = "NEEDS_INFO",
}

export class RequestApprovalService {
  private requestRepository: RequestRepository;
  private userRepository: UserRepository;
  private notificationRepository: NotificationRepository;
  private auditLogRepository: AuditLogRepository;

  constructor(
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {
    // Initialize concrete repository implementations
    this.requestRepository = new RequestRepository();
    this.userRepository = new UserRepository();
    this.notificationRepository = new NotificationRepository();
    this.auditLogRepository = new AuditLogRepository();
  }

  /**
   * Start review process for a request
   */
  async startReview(requestId: string, reviewer: User): Promise<Request> {
    const request = await this.processApproval(
      requestId,
      reviewer,
      ApprovalAction.NEEDS_INFO
    );

    if (!request.isInReview()) {
      throw new Error("Failed to move request into review state");
    }

    return request;
  }

  /**
   * Approve request
   */
  async approveRequest(
    requestId: string,
    approver: User,
    comment?: string
  ): Promise<Request> {
    return this.processApproval(
      requestId,
      approver,
      ApprovalAction.APPROVED,
      comment
    );
  }

  /**
   * Reject request
   */
  async rejectRequest(
    requestId: string,
    reviewer: User,
    reason: string
  ): Promise<Request> {
    return this.processApproval(
      requestId,
      reviewer,
      ApprovalAction.REJECTED,
      reason
    );
  }

  /**
   * Process approval action on a request
   */
  async processApproval(
    requestId: string,
    approver: User,
    action: ApprovalAction,
    comment?: string
  ): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate approver permissions
    this.validateApproverPermissions(request, approver);

    // Validate request status - check if it's in a reviewable state
    if (!request.isSubmitted() && !request.isInReview()) {
      throw new Error(
        `Request is not in reviewable status: ${request.getStatus()}`
      );
    }

    // Start transaction
    await db.transaction(async () => {
      // Start review if needed
      if (request.isSubmitted()) {
        request.startReview(approver.getId().getValue());
      }

      // Process approval action
      switch (action) {
        case ApprovalAction.APPROVED:
          request.approve(approver.getId().getValue());
          break;
        case ApprovalAction.REJECTED:
          request.reject(approver.getId().getValue(), comment);
          break;
        case ApprovalAction.NEEDS_INFO:
          // Keep in review status but add comment
          break;
        default:
          throw new Error(`Invalid approval action: ${action}`);
      }

      // Save the updated request
      await this.requestRepository.save(request);

      // Log audit trail
      await this.auditService.logApprovalAction(
        requestId,
        approver,
        action,
        comment
      );
    });

    // Send notifications (outside transaction)
    await this.notificationService.notifyRequestStatusChange(request, approver);

    return request;
  }

  /**
   * Get approval history for a request
   */
  async getApprovalHistory(requestId: string): Promise<AuditLog[]> {
    // Get audit logs related to approval actions for this request
    const logs = await this.auditLogRepository.findByEntityId(
      "REQUEST",
      requestId
    );

    // Filter for approval-related actions
    return logs.filter((log: AuditLog) => {
      const eventType = log.getEventType();
      return [
        "REQUEST_APPROVED",
        "REQUEST_REJECTED",
        "REQUEST_STATUS_CHANGED",
      ].includes(eventType);
    });
  }

  /**
   * Check if user can approve request
   */
  canApprove(request: Request, user: User): boolean {
    // Business rule: User cannot approve their own request
    if (request.getRequesterId().getValue() === user.getId().getValue()) {
      return false;
    }

    // Business rule: Only admins can approve (no manager role in domain)
    if (!user.isAdmin()) {
      return false;
    }

    // Business rule: Request must be in submitted or in review status
    if (!request.isSubmitted() && !request.isInReview()) {
      return false;
    }

    return true;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(approverId: string): Promise<Request[]> {
    const user = await this.userRepository.findById(UserId.create(approverId));
    if (!user || !user.isAdmin()) {
      return [];
    }

    // Get all submitted and in-review requests
    const submittedRequests = await this.requestRepository.findByStatus(
      RequestStatus.SUBMITTED
    );
    const inReviewRequests = await this.requestRepository.findByStatus(
      RequestStatus.IN_REVIEW
    );

    const allPendingRequests = [...submittedRequests, ...inReviewRequests];

    // Filter out requests created by the approver
    return allPendingRequests.filter(
      (request) => request.getRequesterId().getValue() !== approverId
    );
  }

  /**
   * Validate approver permissions
   */
  private validateApproverPermissions(request: Request, approver: User): void {
    if (!this.canApprove(request, approver)) {
      throw new Error("User does not have permission to approve this request");
    }
  }
}
