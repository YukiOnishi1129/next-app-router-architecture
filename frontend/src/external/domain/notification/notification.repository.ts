import { Notification, NotificationType } from './notification'
import { NotificationId } from './notification-id'
import { AccountId } from '../account'
import { Repository } from '../shared/repository'

/**
 * Notification repository interface
 */
export interface NotificationRepository
  extends Repository<Notification, NotificationId> {
  findByRecipientId(
    recipientId: AccountId,
    limit?: number,
    offset?: number
  ): Promise<Notification[]>
  findUnreadByRecipientId(recipientId: AccountId): Promise<Notification[]>
  countUnreadByRecipientId(recipientId: AccountId): Promise<number>
  markAllAsReadForRecipient(recipientId: AccountId): Promise<void>
  findByTypeAndRecipientId(
    type: NotificationType,
    recipientId: AccountId,
    limit?: number
  ): Promise<Notification[]>
}
