import { Repository } from "../shared/repository";
import { Notification, NotificationType } from "./notification";
import { NotificationId } from "./notification-id";
import { UserId } from "../user";

/**
 * Notification repository interface
 */
export interface NotificationRepository
  extends Repository<Notification, NotificationId> {
  findByRecipientId(
    recipientId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Notification[]>;
  findUnreadByRecipientId(recipientId: UserId): Promise<Notification[]>;
  countUnreadByRecipientId(recipientId: UserId): Promise<number>;
  markAllAsReadForRecipient(recipientId: UserId): Promise<void>;
  findByTypeAndRecipientId(
    type: NotificationType,
    recipientId: UserId,
    limit?: number
  ): Promise<Notification[]>;
}
