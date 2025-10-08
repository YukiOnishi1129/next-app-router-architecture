/**
 * Email value object
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  constructor(private readonly value: string) {
    this.validate(value)
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Email cannot be empty')
    }
    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error(`Invalid email format: ${value}`)
    }
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase()
  }

  toString(): string {
    return this.value
  }
}
