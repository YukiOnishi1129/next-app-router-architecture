import { Request } from '@/external/domain/models/Request';
import { User } from '@/external/domain/models/User';
import { ApprovalHistory } from '@/external/domain/models/ApprovalHistory';
import { RequestStatus } from '@/external/domain/valueobjects/RequestStatus';
import { ApprovalAction } from '@/external/domain/valueobjects/ApprovalAction';
import { RequestRepository } from '@/external/repository/RequestRepository';
import { ApprovalHistoryRepository } from '@/external/repository/ApprovalHistoryRepository';
import { NotificationService } from './NotificationService';
import { AuditService } from './AuditService';

export class RequestApprovalService {
  constructor(
    private requestRepository: RequestRepository,
    private approvalHistoryRepository: ApprovalHistoryRepository,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  /**
   * Process approval action on a request
   */
  async processApproval(
    requestId: string,
    approver: User,
    action: ApprovalAction,
    comment?: string
  ): Promise<Request> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate approver permissions
    this.validateApproverPermissions(request, approver);

    // Validate request status
    if (request.status !== RequestStatus.PENDING) {
      throw new Error(`Request is not in pending status: ${request.status}`);
    }

    // Create approval history record
    const approvalHistory = new ApprovalHistory(
      this.generateId(),
      requestId,
      approver.id,
      action,
      new Date(),
      comment
    );

    // Update request status based on action
    const updatedStatus = this.determineNewStatus(action);
    const updatedRequest = new Request(
      request.id,
      request.title,
      request.description,
      request.requester,
      updatedStatus,
      request.createdAt,
      new Date(),
      request.category,
      request.priority,
      request.metadata
    );

    // Save changes
    await this.approvalHistoryRepository.save(approvalHistory);
    await this.requestRepository.save(updatedRequest);

    // Send notifications
    await this.notificationService.notifyRequestStatusChange(updatedRequest, approver);

    // Log audit trail
    await this.auditService.logApprovalAction(requestId, approver, action, comment);

    return updatedRequest;
  }

  /**
   * Get approval history for a request
   */
  async getApprovalHistory(requestId: string): Promise<ApprovalHistory[]> {
    return this.approvalHistoryRepository.findByRequestId(requestId);
  }

  /**
   * Check if user can approve request
   */
  canApprove(request: Request, user: User): boolean {
    // Business rule: User cannot approve their own request
    if (request.requester.id === user.id) {
      return false;
    }

    // Business rule: Only managers and admins can approve
    if (!['MANAGER', 'ADMIN'].includes(user.role)) {
      return false;
    }

    // Business rule: Request must be in pending status
    if (request.status !== RequestStatus.PENDING) {
      return false;
    }

    return true;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(approverId: string): Promise<Request[]> {
    const user = await this.requestRepository.findById(approverId);
    if (!user || !['MANAGER', 'ADMIN'].includes(user.role)) {
      return [];
    }

    const allPendingRequests = await this.requestRepository.findByStatus(RequestStatus.PENDING);
    
    // Filter out requests created by the approver
    return allPendingRequests.filter(request => request.requester.id !== approverId);
  }

  /**
   * Validate approver permissions
   */
  private validateApproverPermissions(request: Request, approver: User): void {
    if (!this.canApprove(request, approver)) {
      throw new Error('User does not have permission to approve this request');
    }
  }

  /**
   * Determine new status based on approval action
   */
  private determineNewStatus(action: ApprovalAction): RequestStatus {
    switch (action) {
      case ApprovalAction.APPROVED:
        return RequestStatus.APPROVED;
      case ApprovalAction.REJECTED:
        return RequestStatus.REJECTED;
      case ApprovalAction.NEEDS_INFO:
        return RequestStatus.PENDING;
      default:
        throw new Error(`Invalid approval action: ${action}`);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}