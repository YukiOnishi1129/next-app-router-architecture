/**
 * Base class for strongly-typed IDs
 */
export abstract class ID<T> {
  constructor(private readonly value: T) {
    this.validate(value);
  }

  protected abstract validate(value: T): void;

  getValue(): T {
    return this.value;
  }

  equals(other: ID<T>): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}

/**
 * UUID-based ID
 */
export class UUID extends ID<string> {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  protected validate(value: string): void {
    if (!UUID.UUID_REGEX.test(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }
  }

  static generate(): UUID {
    // Simple UUID v4 generator
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    return new UUID(uuid);
  }
}
