import { UUID } from "../value-objects";

/**
 * Base class for all domain events
 */
export abstract class DomainEvent {
  readonly eventId: UUID;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventType: string;

  constructor(aggregateId: string, eventType: string) {
    this.eventId = UUID.generate();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
    this.eventType = eventType;
  }

  abstract toPayload(): Record<string, unknown>;
}
