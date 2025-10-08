import { DomainEvent } from '../shared/events'
import { UserId } from '../user'
import {
  RequestCreatedEvent,
  RequestSubmittedEvent,
  RequestApprovedEvent,
  RequestRejectedEvent,
} from './events'
import { RequestId } from './request-id'
import { RequestStatus, RequestPriority, RequestType } from './request-status'

/**
 * Request entity - represents a user request
 */
export class Request {
  private attachmentIds: string[] = []
  private domainEvents: DomainEvent[] = []

  private constructor(
    private readonly id: RequestId,
    private title: string,
    private description: string,
    private type: RequestType,
    private priority: RequestPriority,
    private status: RequestStatus,
    private readonly requesterId: UserId,
    private assigneeId: UserId | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private submittedAt: Date | null,
    private reviewedAt: Date | null,
    private reviewerId: UserId | null
  ) {}

  static create(params: {
    title: string
    description: string
    type: RequestType
    priority: RequestPriority
    requesterId: string
    assigneeId?: string
  }): Request {
    const now = new Date()
    const request = new Request(
      RequestId.generate(),
      params.title,
      params.description,
      params.type,
      params.priority,
      RequestStatus.DRAFT,
      UserId.create(params.requesterId),
      params.assigneeId ? UserId.create(params.assigneeId) : null,
      now,
      now,
      null,
      null,
      null
    )

    // Emit domain event
    request.addDomainEvent(
      new RequestCreatedEvent(
        request.id.getValue(),
        params.requesterId,
        params.title,
        params.type,
        params.priority
      )
    )

    return request
  }

  static restore(params: {
    id: string
    title: string
    description: string
    type: RequestType
    priority: RequestPriority
    status: RequestStatus
    requesterId: string
    assigneeId: string | null
    attachmentIds: string[]
    createdAt: Date
    updatedAt: Date
    submittedAt: Date | null
    reviewedAt: Date | null
    reviewerId: string | null
  }): Request {
    const request = new Request(
      RequestId.create(params.id),
      params.title,
      params.description,
      params.type,
      params.priority,
      params.status,
      UserId.create(params.requesterId),
      params.assigneeId ? UserId.create(params.assigneeId) : null,
      params.createdAt,
      params.updatedAt,
      params.submittedAt,
      params.reviewedAt,
      params.reviewerId ? UserId.create(params.reviewerId) : null
    )
    request.attachmentIds = [...params.attachmentIds]
    return request
  }

  getId(): RequestId {
    return this.id
  }

  getTitle(): string {
    return this.title
  }

  getDescription(): string {
    return this.description
  }

  getType(): RequestType {
    return this.type
  }

  getPriority(): RequestPriority {
    return this.priority
  }

  getStatus(): RequestStatus {
    return this.status
  }

  getRequesterId(): UserId {
    return this.requesterId
  }

  getAssigneeId(): UserId | null {
    return this.assigneeId
  }

  getAttachmentIds(): string[] {
    return [...this.attachmentIds]
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt)
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt)
  }

  getSubmittedAt(): Date | null {
    return this.submittedAt ? new Date(this.submittedAt) : null
  }

  getReviewedAt(): Date | null {
    return this.reviewedAt ? new Date(this.reviewedAt) : null
  }

  getReviewerId(): UserId | null {
    return this.reviewerId
  }

  isDraft(): boolean {
    return this.status === RequestStatus.DRAFT
  }

  isSubmitted(): boolean {
    return this.status === RequestStatus.SUBMITTED
  }

  isInReview(): boolean {
    return this.status === RequestStatus.IN_REVIEW
  }

  isApproved(): boolean {
    return this.status === RequestStatus.APPROVED
  }

  isRejected(): boolean {
    return this.status === RequestStatus.REJECTED
  }

  isCancelled(): boolean {
    return this.status === RequestStatus.CANCELLED
  }

  canEdit(): boolean {
    return this.status === RequestStatus.DRAFT
  }

  canSubmit(): boolean {
    return this.status === RequestStatus.DRAFT
  }

  canCancel(): boolean {
    return [
      RequestStatus.DRAFT,
      RequestStatus.SUBMITTED,
      RequestStatus.IN_REVIEW,
    ].includes(this.status)
  }

  update(params: {
    title: string
    description: string
    type: RequestType
    priority: RequestPriority
  }): void {
    if (!this.canEdit()) {
      throw new Error('Request cannot be edited in current status')
    }
    this.title = params.title
    this.description = params.description
    this.type = params.type
    this.priority = params.priority
    this.updatedAt = new Date()
  }

  submit(): void {
    if (!this.canSubmit()) {
      throw new Error('Request cannot be submitted in current status')
    }
    this.status = RequestStatus.SUBMITTED
    this.submittedAt = new Date()
    this.updatedAt = new Date()

    // Emit domain event
    this.addDomainEvent(
      new RequestSubmittedEvent(
        this.id.getValue(),
        this.requesterId.getValue(),
        this.submittedAt
      )
    )
  }

  startReview(reviewerId: string): void {
    if (this.status !== RequestStatus.SUBMITTED) {
      throw new Error('Request must be submitted before review')
    }
    this.status = RequestStatus.IN_REVIEW
    this.reviewerId = UserId.create(reviewerId)
    this.updatedAt = new Date()
  }

  approve(reviewerId: string): void {
    if (this.status !== RequestStatus.IN_REVIEW) {
      throw new Error('Request must be in review before approval')
    }
    this.status = RequestStatus.APPROVED
    this.reviewerId = UserId.create(reviewerId)
    this.reviewedAt = new Date()
    this.updatedAt = new Date()

    // Emit domain event
    this.addDomainEvent(
      new RequestApprovedEvent(
        this.id.getValue(),
        reviewerId,
        this.requesterId.getValue(),
        this.reviewedAt
      )
    )
  }

  reject(reviewerId: string, reason?: string): void {
    if (this.status !== RequestStatus.IN_REVIEW) {
      throw new Error('Request must be in review before rejection')
    }
    this.status = RequestStatus.REJECTED
    this.reviewerId = UserId.create(reviewerId)
    this.reviewedAt = new Date()
    this.updatedAt = new Date()

    // Emit domain event
    this.addDomainEvent(
      new RequestRejectedEvent(
        this.id.getValue(),
        reviewerId,
        this.requesterId.getValue(),
        this.reviewedAt,
        reason
      )
    )
  }

  cancel(): void {
    if (!this.canCancel()) {
      throw new Error('Request cannot be cancelled in current status')
    }
    this.status = RequestStatus.CANCELLED
    this.updatedAt = new Date()
  }

  assignTo(assigneeId: string): void {
    this.assigneeId = UserId.create(assigneeId)
    this.updatedAt = new Date()
  }

  addAttachment(attachmentId: string): void {
    if (!this.attachmentIds.includes(attachmentId)) {
      this.attachmentIds.push(attachmentId)
      this.updatedAt = new Date()
    }
  }

  removeAttachment(attachmentId: string): void {
    const index = this.attachmentIds.indexOf(attachmentId)
    if (index > -1) {
      this.attachmentIds.splice(index, 1)
      this.updatedAt = new Date()
    }
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      title: this.title,
      description: this.description,
      type: this.type,
      priority: this.priority,
      status: this.status,
      requesterId: this.requesterId.getValue(),
      assigneeId: this.assigneeId?.getValue() || null,
      attachmentIds: this.attachmentIds,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      submittedAt: this.submittedAt?.toISOString() || null,
      reviewedAt: this.reviewedAt?.toISOString() || null,
      reviewerId: this.reviewerId?.getValue() || null,
    }
  }

  // Domain event handling
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event)
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents]
  }

  clearDomainEvents(): void {
    this.domainEvents = []
  }
}
