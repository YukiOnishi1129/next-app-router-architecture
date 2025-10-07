import { UUID } from "../shared/value-objects";

/**
 * NotificationId value object
 */
export class NotificationId extends UUID {
  static create(value: string): NotificationId {
    return new NotificationId(value);
  }

  static generate(): NotificationId {
    const uuid = super.generate();
    return new NotificationId(uuid.getValue());
  }
}
