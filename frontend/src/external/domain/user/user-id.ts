import { UUID } from "../shared/value-objects";

/**
 * UserId value object
 */
export class UserId extends UUID {
  static create(value: string): UserId {
    return new UserId(value);
  }

  static generate(): UserId {
    const uuid = super.generate();
    return new UserId(uuid.getValue());
  }
}
