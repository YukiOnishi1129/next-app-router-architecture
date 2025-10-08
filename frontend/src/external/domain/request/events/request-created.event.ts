import { DomainEvent } from "../../shared/events";
import { RequestType, RequestPriority } from "../request-status";

export class RequestCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    private readonly requesterId: string,
    private readonly title: string,
    private readonly type: RequestType,
    private readonly priority: RequestPriority
  ) {
    super(aggregateId, "RequestCreated");
  }

  toPayload(): Record<string, unknown> {
    return {
      requestId: this.aggregateId,
      requesterId: this.requesterId,
      title: this.title,
      type: this.type,
      priority: this.priority,
    };
  }
}
