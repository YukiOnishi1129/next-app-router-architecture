import {
  Request,
  RequestId,
  RequestStatus,
  RequestPriority,
  RequestType,
  User,
  UserId,
} from "@/external/domain";
import { RequestRepository } from "@/external/repository";
import { NotificationService } from "../notification/NotificationService";
import { AuditService } from "../audit/AuditService";
import { db } from "@/external/client/db/client";

export interface CreateRequestDto {
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  assigneeId?: string;
}

export interface UpdateRequestDto {
  title?: string;
  description?: string;
  type?: RequestType;
  priority?: RequestPriority;
}

export class RequestWorkflowService {
  private requestRepository: RequestRepository;

  constructor(
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {
    // Initialize concrete repository implementations
    this.requestRepository = new RequestRepository();
  }

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
    const request = Request.create({
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      requesterId: requester.getId().getValue(),
      assigneeId: data.assigneeId,
    });

    // Save request in transaction
    await db.transaction(async () => {
      await this.requestRepository.save(request);

      // Log audit trail
      await this.auditService.logRequestCreated(request);
    });

    // Send notifications (outside transaction)
    await this.notificationService.notifyNewRequest(request);

    return request;
  }

  /**
   * Retrieve request by ID
   */
  async getRequestById(requestId: string): Promise<Request | null> {
    return this.requestRepository.findById(RequestId.create(requestId));
  }

  /**
   * Get requests created by specific user
   */
  async getRequestsForRequester(
    requesterId: string,
    limit?: number,
    offset?: number
  ): Promise<Request[]> {
    return this.requestRepository.findByRequesterId(
      UserId.create(requesterId),
      limit,
      offset
    );
  }

  /**
   * Get requests assigned to specific user
   */
  async getRequestsForAssignee(
    assigneeId: string,
    limit?: number,
    offset?: number
  ): Promise<Request[]> {
    return this.requestRepository.findByAssigneeId(
      UserId.create(assigneeId),
      limit,
      offset
    );
  }

  /**
   * Get all requests (admin/reporting use cases)
   */
  async getAllRequests(limit?: number, offset?: number): Promise<Request[]> {
    return this.requestRepository.findAll(limit, offset);
  }

  /**
   * Update an existing request
   */
  async updateRequest(
    requestId: string,
    updater: User,
    data: UpdateRequestDto
  ): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate update permissions
    this.validateUpdatePermissions(request, updater);

    // Store old priority for comparison
    const oldPriority = request.getPriority();

    // Update request fields if they're editable
    if (
      data.title !== undefined ||
      data.description !== undefined ||
      data.type !== undefined ||
      data.priority !== undefined
    ) {
      request.update({
        title: data.title ?? request.getTitle(),
        description: data.description ?? request.getDescription(),
        type: data.type ?? request.getType(),
        priority: data.priority ?? request.getPriority(),
      });
    }

    // Save changes in transaction
    await db.transaction(async () => {
      await this.requestRepository.save(request);

      // Log audit trail
      await this.auditService.logRequestUpdated(requestId, updater, data);
    });

    // Send notifications if priority changed (outside transaction)
    if (data.priority && data.priority !== oldPriority) {
      await this.notificationService.notifyPriorityChange(request, oldPriority);
    }

    return request;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(
    requestId: string,
    canceller: User,
    reason: string
  ): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate cancellation permissions
    this.validateCancellationPermissions(request, canceller);

    // Cancel the request
    request.cancel();

    // Save changes in transaction
    await db.transaction(async () => {
      await this.requestRepository.save(request);

      // Log audit trail
      await this.auditService.logRequestCancelled(requestId, canceller, reason);
    });

    // Send notifications (outside transaction)
    await this.notificationService.notifyRequestCancelled(request, reason);

    return request;
  }

  /**
   * Assign request to a user (admin only)
   */
  async assignRequest(
    requestId: string,
    actor: User,
    assigneeId: string
  ): Promise<Request> {
    if (!actor.isAdmin()) {
      throw new Error("User does not have permission to assign requests");
    }

    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    request.assignTo(assigneeId);

    await db.transaction(async () => {
      await this.requestRepository.save(request);

      await this.auditService.logAction({
        action: "request.assign",
        entityType: "REQUEST",
        entityId: requestId,
        userId: actor.getId().getValue(),
        metadata: {
          assigneeId,
        },
      });
    });

    await this.notificationService.notifyAssignment(request);

    return request;
  }

  /**
   * Submit a request for review
   */
  async submitRequest(requestId: string, submitter: User): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Validate submission permissions
    if (request.getRequesterId().getValue() !== submitter.getId().getValue()) {
      throw new Error("Only the requester can submit their own request");
    }

    // Submit the request
    request.submit();

    // Save changes
    await this.requestRepository.save(request);

    // Send notifications
    await this.notificationService.notifyNewRequest(request);

    return request;
  }

  /**
   * Get workflow status for a request
   */
  async getWorkflowStatus(requestId: string): Promise<{
    currentStatus: RequestStatus;
    canBeUpdated: boolean;
    canBeCancelled: boolean;
    canBeSubmitted: boolean;
    nextPossibleStatuses: RequestStatus[];
  }> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    return {
      currentStatus: request.getStatus(),
      canBeUpdated: request.canEdit(),
      canBeCancelled: request.canCancel(),
      canBeSubmitted: request.canSubmit(),
      nextPossibleStatuses: this.getNextPossibleStatuses(request.getStatus()),
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
  async getRequestsByPriority(priority: RequestPriority): Promise<Request[]> {
    // This method is not directly supported by the repository
    // We would need to add it or fetch all and filter
    const allRequests: Request[] = [];

    // Fetch by different statuses and filter by priority
    for (const status of Object.values(RequestStatus)) {
      const requests = await this.requestRepository.findByStatus(
        status as RequestStatus
      );
      allRequests.push(...requests.filter((r) => r.getPriority() === priority));
    }

    return allRequests;
  }

  /**
   * Validate request data
   */
  private validateRequestData(data: CreateRequestDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Request title is required");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error("Request description is required");
    }

    if (data.title.length > 200) {
      throw new Error("Request title must not exceed 200 characters");
    }

    if (data.description.length > 5000) {
      throw new Error("Request description must not exceed 5000 characters");
    }
  }

  /**
   * Validate update permissions
   */
  private validateUpdatePermissions(request: Request, updater: User): void {
    // Only requester can update their own draft request
    if (
      request.getRequesterId().getValue() !== updater.getId().getValue() &&
      !updater.isAdmin()
    ) {
      throw new Error("User does not have permission to update this request");
    }

    // Cannot update if not in draft status
    if (!request.canEdit()) {
      throw new Error("Cannot update request in current status");
    }
  }

  /**
   * Validate cancellation permissions
   */
  private validateCancellationPermissions(
    request: Request,
    canceller: User
  ): void {
    // Only requester or admin can cancel
    if (
      request.getRequesterId().getValue() !== canceller.getId().getValue() &&
      !canceller.isAdmin()
    ) {
      throw new Error("User does not have permission to cancel this request");
    }

    // Check if request can be cancelled
    if (!request.canCancel()) {
      throw new Error("Cannot cancel request in current status");
    }
  }

  /**
   * Get next possible statuses
   */
  private getNextPossibleStatuses(
    currentStatus: RequestStatus
  ): RequestStatus[] {
    switch (currentStatus) {
      case RequestStatus.DRAFT:
        return [RequestStatus.SUBMITTED, RequestStatus.CANCELLED];
      case RequestStatus.SUBMITTED:
        return [RequestStatus.IN_REVIEW, RequestStatus.CANCELLED];
      case RequestStatus.IN_REVIEW:
        return [
          RequestStatus.APPROVED,
          RequestStatus.REJECTED,
          RequestStatus.CANCELLED,
        ];
      case RequestStatus.APPROVED:
      case RequestStatus.REJECTED:
      case RequestStatus.CANCELLED:
        return [];
      default:
        return [];
    }
  }
}
