import { DomainEvent } from "../../shared/events";

export class RequestRejectedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    private readonly reviewerId: string,
    private readonly requesterId: string,
    private readonly rejectedAt: Date,
    private readonly reason?: string
  ) {
    super(aggregateId, "RequestRejected");
  }

  toPayload(): Record<string, unknown> {
    return {
      requestId: this.aggregateId,
      reviewerId: this.reviewerId,
      requesterId: this.requesterId,
      rejectedAt: this.rejectedAt.toISOString(),
      reason: this.reason,
    };
  }
}
