import { UUID } from '../shared/value-objects'

/**
 * AuditLogId value object
 */
export class AuditLogId extends UUID {
  static create(value: string): AuditLogId {
    return new AuditLogId(value)
  }

  static generate(): AuditLogId {
    const uuid = super.generate()
    return new AuditLogId(uuid.getValue())
  }
}
