import { DomainEvent } from '../../shared/events';

export class RequestApprovedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    private readonly reviewerId: string,
    private readonly requesterId: string,
    private readonly approvedAt: Date
  ) {
    super(aggregateId, 'RequestApproved');
  }

  toPayload(): Record<string, unknown> {
    return {
      requestId: this.aggregateId,
      reviewerId: this.reviewerId,
      requesterId: this.requesterId,
      approvedAt: this.approvedAt.toISOString(),
    };
  }
}