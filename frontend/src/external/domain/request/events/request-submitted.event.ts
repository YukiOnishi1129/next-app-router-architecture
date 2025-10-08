import { DomainEvent } from '../../shared/events'

export class RequestSubmittedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    private readonly requesterId: string,
    private readonly submittedAt: Date
  ) {
    super(aggregateId, 'RequestSubmitted')
  }

  toPayload(): Record<string, unknown> {
    return {
      requestId: this.aggregateId,
      requesterId: this.requesterId,
      submittedAt: this.submittedAt.toISOString(),
    }
  }
}
