import { Id } from "../shared/value-objects";

/**
 * NotificationId value object
 */
export class NotificationId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): NotificationId {
    return new NotificationId(value);
  }

  static generate(): NotificationId {
    return new NotificationId(Id.generateValue());
  }
}
