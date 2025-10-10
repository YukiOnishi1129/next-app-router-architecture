import { eq, inArray } from 'drizzle-orm'

import { db } from '@/external/client/db/client'
import { accounts } from '@/external/client/db/schema'
import {
  AccountRepository as IAccountRepository,
  Account,
  AccountId,
  Email,
  AccountStatus,
  AccountRole,
} from '@/external/domain'

export class AccountRepository implements IAccountRepository {
  async findAll(): Promise<Account[]> {
    const result = await db.select().from(accounts)
    return result.map((row) => this.mapToDomainEntity(row))
  }

  async findById(id: AccountId): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id.getValue()))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.mapToDomainEntity(result[0])
  }

  async findByEmail(email: Email): Promise<Account | null> {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, email.getValue()))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    return this.mapToDomainEntity(result[0])
  }

  async findByIds(ids: AccountId[]): Promise<Account[]> {
    if (ids.length === 0) {
      return []
    }

    const idValues = ids.map((id) => id.getValue())
    const result = await db
      .select()
      .from(accounts)
      .where(inArray(accounts.id, idValues))

    return result.map((row) => this.mapToDomainEntity(row))
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const result = await db
      .select({ count: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, email.getValue()))
      .limit(1)

    return result.length > 0
  }

  async save(entity: Account): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      name: entity.getName(),
      email: entity.getEmail().getValue(),
      status: entity.getStatus(),
      roles: entity.getRoles(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    }

    await db
      .insert(accounts)
      .values(data)
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          name: data.name,
          email: data.email,
          status: data.status,
          roles: data.roles,
          updatedAt: data.updatedAt,
        },
      })
  }

  async delete(id: AccountId): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id.getValue()))
  }

  private mapToDomainEntity(row: typeof accounts.$inferSelect): Account {
    return Account.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status as AccountStatus,
      roles: row.roles as AccountRole[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
