import { eq, and, desc, count } from "drizzle-orm";

import { db } from "@/external/client/db/client";
import { notifications } from "@/external/client/db/schema";
import {
  NotificationRepository as INotificationRepository,
  Notification,
  NotificationId,
  NotificationType,
  UserId,
} from "@/external/domain";

export class NotificationRepository implements INotificationRepository {
  private applyPagination<T>(query: T, limit?: number, offset?: number): T {
    let result = query as unknown as {
      limit: (value: number) => unknown;
      offset: (value: number) => unknown;
    };

    if (limit !== undefined) {
      result = result.limit(limit) as typeof result;
    }

    if (offset !== undefined) {
      result = result.offset(offset) as typeof result;
    }

    return result as unknown as T;
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByRecipientId(
    recipientId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Notification[]> {
    const baseQuery = db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, recipientId.getValue()))
      .orderBy(desc(notifications.createdAt));

    const query = this.applyPagination(baseQuery, limit, offset);
    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async findUnreadByRecipientId(recipientId: UserId): Promise<Notification[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId.getValue()),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));

    return result.map((row) => this.mapToDomainEntity(row));
  }

  async countUnreadByRecipientId(recipientId: UserId): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId.getValue()),
          eq(notifications.isRead, false)
        )
      );

    return result[0]?.value || 0;
  }

  async markAllAsReadForRecipient(recipientId: UserId): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientId, recipientId.getValue()),
          eq(notifications.isRead, false)
        )
      );
  }

  async findByTypeAndRecipientId(
    type: NotificationType,
    recipientId: UserId,
    limit?: number
  ): Promise<Notification[]> {
    const baseQuery = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.type, type),
          eq(notifications.recipientId, recipientId.getValue())
        )
      )
      .orderBy(desc(notifications.createdAt));

    const query = this.applyPagination(baseQuery, limit);
    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async save(entity: Notification): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      type: entity.getType(),
      title: entity.getTitle(),
      message: entity.getMessage(),
      recipientId: entity.getRecipientId().getValue(),
      relatedEntityType: entity.getRelatedEntityType(),
      relatedEntityId: entity.getRelatedEntityId(),
      isRead: entity.getIsRead(),
      readAt: entity.getReadAt(),
      createdAt: entity.getCreatedAt(),
    };

    await db
      .insert(notifications)
      .values(data)
      .onConflictDoUpdate({
        target: notifications.id,
        set: {
          isRead: data.isRead,
          readAt: data.readAt,
        },
      });
  }

  async delete(id: NotificationId): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id.getValue()));
  }

  private mapToDomainEntity(
    row: typeof notifications.$inferSelect
  ): Notification {
    return Notification.restore({
      id: row.id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      recipientId: row.recipientId,
      relatedEntityType: row.relatedEntityType,
      relatedEntityId: row.relatedEntityId,
      isRead: row.isRead,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
