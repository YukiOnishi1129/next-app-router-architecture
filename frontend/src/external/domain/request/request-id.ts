import { UUID } from '../shared/value-objects'

/**
 * RequestId value object
 */
export class RequestId extends UUID {
  static create(value: string): RequestId {
    return new RequestId(value)
  }

  static generate(): RequestId {
    const uuid = super.generate()
    return new RequestId(uuid.getValue())
  }
}
