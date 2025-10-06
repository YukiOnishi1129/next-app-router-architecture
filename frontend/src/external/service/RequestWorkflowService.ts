import { Request } from '@/external/domain/models/Request';
import { User } from '@/external/domain/models/User';
import { RequestStatus } from '@/external/domain/valueobjects/RequestStatus';
import { Priority } from '@/external/domain/valueobjects/Priority';
import { RequestCategory } from '@/external/domain/valueobjects/RequestCategory';
import { RequestRepository } from '@/external/repository/RequestRepository';
import { NotificationService } from './NotificationService';
import { AuditService } from './AuditService';

export interface CreateRequestDto {
  title: string;
  description: string;
  category: RequestCategory;
  priority: Priority;
  metadata?: Record<string, any>;
}

export interface UpdateRequestDto {
  title?: string;
  description?: string;
  category?: RequestCategory;
  priority?: Priority;
  metadata?: Record<string, any>;
}

export class RequestWorkflowService {
  constructor(
    private requestRepository: RequestRepository,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  /**
   * Create a new request
   */
  async createRequest(
    requester: User,
    data: CreateRequestDto
  ): Promise<Request> {
    // Validate request data
    this.validateRequestData(data);

    // Create new request with initial status
    const request = new Request(
      this.generateId(),
      data.title,
      data.description,
      requester,
      RequestStatus.PENDING,
      new Date(),
      new Date(),
      data.category,
      data.priority,
      data.metadata
    );

    // Save request
    await this.requestRepository.save(request);

    // Send notifications
    await this.notificationService.notifyNewRequest(request);

    // Log audit trail
    await this.auditService.logRequestCreated(request);

    return request;
  }

  /**
   * Update an existing request
   */
  async updateRequest(
    requestId: string,
    updater: User,
    data: UpdateRequestDto
  ): Promise<Request> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate update permissions
    this.validateUpdatePermissions(request, updater);

    // Create updated request
    const updatedRequest = new Request(
      request.id,
      data.title ?? request.title,
      data.description ?? request.description,
      request.requester,
      request.status,
      request.createdAt,
      new Date(),
      data.category ?? request.category,
      data.priority ?? request.priority,
      { ...request.metadata, ...data.metadata }
    );

    // Save changes
    await this.requestRepository.save(updatedRequest);

    // Send notifications if priority changed
    if (data.priority && data.priority !== request.priority) {
      await this.notificationService.notifyPriorityChange(updatedRequest, request.priority);
    }

    // Log audit trail
    await this.auditService.logRequestUpdated(requestId, updater, data);

    return updatedRequest;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(
    requestId: string,
    canceller: User,
    reason: string
  ): Promise<Request> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate cancellation permissions
    this.validateCancellationPermissions(request, canceller);

    // Update status to cancelled
    const cancelledRequest = new Request(
      request.id,
      request.title,
      request.description,
      request.requester,
      RequestStatus.CANCELLED,
      request.createdAt,
      new Date(),
      request.category,
      request.priority,
      { ...request.metadata, cancellationReason: reason }
    );

    // Save changes
    await this.requestRepository.save(cancelledRequest);

    // Send notifications
    await this.notificationService.notifyRequestCancelled(cancelledRequest, reason);

    // Log audit trail
    await this.auditService.logRequestCancelled(requestId, canceller, reason);

    return cancelledRequest;
  }

  /**
   * Get workflow status for a request
   */
  async getWorkflowStatus(requestId: string): Promise<{
    currentStatus: RequestStatus;
    canBeUpdated: boolean;
    canBeCancelled: boolean;
    nextPossibleStatuses: RequestStatus[];
  }> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    return {
      currentStatus: request.status,
      canBeUpdated: this.canBeUpdated(request.status),
      canBeCancelled: this.canBeCancelled(request.status),
      nextPossibleStatuses: this.getNextPossibleStatuses(request.status)
    };
  }

  /**
   * Get requests by workflow status
   */
  async getRequestsByStatus(status: RequestStatus): Promise<Request[]> {
    return this.requestRepository.findByStatus(status);
  }

  /**
   * Get requests by priority
   */
  async getRequestsByPriority(priority: Priority): Promise<Request[]> {
    return this.requestRepository.findByPriority(priority);
  }

  /**
   * Validate request data
   */
  private validateRequestData(data: CreateRequestDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Request title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Request description is required');
    }

    if (data.title.length > 200) {
      throw new Error('Request title must not exceed 200 characters');
    }

    if (data.description.length > 5000) {
      throw new Error('Request description must not exceed 5000 characters');
    }
  }

  /**
   * Validate update permissions
   */
  private validateUpdatePermissions(request: Request, updater: User): void {
    // Only requester can update their own pending request
    if (request.requester.id !== updater.id && updater.role !== 'ADMIN') {
      throw new Error('User does not have permission to update this request');
    }

    // Cannot update approved or rejected requests
    if ([RequestStatus.APPROVED, RequestStatus.REJECTED].includes(request.status)) {
      throw new Error('Cannot update request in current status');
    }
  }

  /**
   * Validate cancellation permissions
   */
  private validateCancellationPermissions(request: Request, canceller: User): void {
    // Only requester or admin can cancel
    if (request.requester.id !== canceller.id && canceller.role !== 'ADMIN') {
      throw new Error('User does not have permission to cancel this request');
    }

    // Cannot cancel completed requests
    if ([RequestStatus.APPROVED, RequestStatus.REJECTED, RequestStatus.CANCELLED].includes(request.status)) {
      throw new Error('Cannot cancel request in current status');
    }
  }

  /**
   * Check if request can be updated
   */
  private canBeUpdated(status: RequestStatus): boolean {
    return status === RequestStatus.PENDING;
  }

  /**
   * Check if request can be cancelled
   */
  private canBeCancelled(status: RequestStatus): boolean {
    return status === RequestStatus.PENDING;
  }

  /**
   * Get next possible statuses
   */
  private getNextPossibleStatuses(currentStatus: RequestStatus): RequestStatus[] {
    switch (currentStatus) {
      case RequestStatus.PENDING:
        return [RequestStatus.APPROVED, RequestStatus.REJECTED, RequestStatus.CANCELLED];
      case RequestStatus.APPROVED:
      case RequestStatus.REJECTED:
      case RequestStatus.CANCELLED:
        return [];
      default:
        return [];
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}