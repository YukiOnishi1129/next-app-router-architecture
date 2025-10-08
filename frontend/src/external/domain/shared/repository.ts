/**
 * Base repository interface for domain aggregates
 */
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>
  save(entity: T): Promise<void>
  delete(id: ID): Promise<void>
}
