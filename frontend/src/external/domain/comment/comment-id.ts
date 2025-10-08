import { UUID } from "../shared/value-objects";

/**
 * CommentId value object
 */
export class CommentId extends UUID {
  static create(value: string): CommentId {
    return new CommentId(value);
  }

  static generate(): CommentId {
    const uuid = super.generate();
    return new CommentId(uuid.getValue());
  }
}
