import { UUID } from "../shared/value-objects";

/**
 * AttachmentId value object
 */
export class AttachmentId extends UUID {
  static create(value: string): AttachmentId {
    return new AttachmentId(value);
  }

  static generate(): AttachmentId {
    const uuid = super.generate();
    return new AttachmentId(uuid.getValue());
  }
}
