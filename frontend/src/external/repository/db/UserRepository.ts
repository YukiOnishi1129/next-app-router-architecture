import { eq, inArray } from "drizzle-orm";
import { db } from "@/external/client/db/client";
import { users } from "@/external/client/db/schema";
import {
  UserRepository as IUserRepository,
  User,
  UserId,
  Email,
  UserStatus,
  UserRole,
} from "@/external/domain";

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const result = await db.select().from(users);
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async findById(id: UserId): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByIds(ids: UserId[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    const idValues = ids.map((id) => id.getValue());
    const result = await db
      .select()
      .from(users)
      .where(inArray(users.id, idValues));

    return result.map((row) => this.mapToDomainEntity(row));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const result = await db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.email, email.getValue()))
      .limit(1);

    return result.length > 0;
  }

  async save(entity: User): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      name: entity.getName(),
      email: entity.getEmail().getValue(),
      status: entity.getStatus(),
      roles: entity.getRoles(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };

    await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: data.name,
          email: data.email,
          status: data.status,
          roles: data.roles,
          updatedAt: data.updatedAt,
        },
      });
  }

  async delete(id: UserId): Promise<void> {
    await db.delete(users).where(eq(users.id, id.getValue()));
  }

  private mapToDomainEntity(row: typeof users.$inferSelect): User {
    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status as UserStatus,
      roles: row.roles as UserRole[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
