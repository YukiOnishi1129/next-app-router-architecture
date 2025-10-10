import { UUID } from '../shared/value-objects'

/**
 * AccountId value object
 */
export class AccountId extends UUID {
  static create(value: string): AccountId {
    return new AccountId(value)
  }

  static generate(): AccountId {
    const uuid = super.generate()
    return new AccountId(uuid.getValue())
  }
}
