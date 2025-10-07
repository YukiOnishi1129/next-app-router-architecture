import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../client/db/client";
import { notifications } from "../client/db/schema";
import {
  NotificationRepository as INotificationRepository,
  Notification,
  NotificationId,
  NotificationType,
  UserId,
} from "../domain";

export class NotificationRepository implements INotificationRepository {
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
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, recipientId.getValue()))
      .orderBy(desc(notifications.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

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
    let query = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.type, type),
          eq(notifications.recipientId, recipientId.getValue())
        )
      )
      .orderBy(desc(notifications.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

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
