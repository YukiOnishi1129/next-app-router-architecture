import { UserId } from '../user';
import { NotificationId } from './notification-id';

/**
 * Notification type enum
 */
export enum NotificationType {
  REQUEST_CREATED = 'REQUEST_CREATED',
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_ASSIGNED = 'REQUEST_ASSIGNED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM',
}

/**
 * Notification entity - represents a notification to a user
 */
export class Notification {
  private constructor(
    private readonly id: NotificationId,
    private readonly type: NotificationType,
    private readonly title: string,
    private readonly message: string,
    private readonly recipientId: UserId,
    private readonly relatedEntityType: string | null,
    private readonly relatedEntityId: string | null,
    private isRead: boolean,
    private readAt: Date | null,
    private readonly createdAt: Date
  ) {}

  static create(params: {
    type: NotificationType;
    title: string;
    message: string;
    recipientId: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Notification {
    return new Notification(
      NotificationId.generate(),
      params.type,
      params.title,
      params.message,
      UserId.create(params.recipientId),
      params.relatedEntityType || null,
      params.relatedEntityId || null,
      false,
      null,
      new Date()
    );
  }

  static restore(params: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    recipientId: string;
    relatedEntityType: string | null;
    relatedEntityId: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }): Notification {
    return new Notification(
      NotificationId.create(params.id),
      params.type,
      params.title,
      params.message,
      UserId.create(params.recipientId),
      params.relatedEntityType,
      params.relatedEntityId,
      params.isRead,
      params.readAt,
      params.createdAt
    );
  }

  getId(): NotificationId {
    return this.id;
  }

  getType(): NotificationType {
    return this.type;
  }

  getTitle(): string {
    return this.title;
  }

  getMessage(): string {
    return this.message;
  }

  getRecipientId(): UserId {
    return this.recipientId;
  }

  getRelatedEntityType(): string | null {
    return this.relatedEntityType;
  }

  getRelatedEntityId(): string | null {
    return this.relatedEntityId;
  }

  getIsRead(): boolean {
    return this.isRead;
  }

  getReadAt(): Date | null {
    return this.readAt ? new Date(this.readAt) : null;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  markAsRead(): void {
    if (this.isRead) {
      return;
    }
    this.isRead = true;
    this.readAt = new Date();
  }

  markAsUnread(): void {
    this.isRead = false;
    this.readAt = null;
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      type: this.type,
      title: this.title,
      message: this.message,
      recipientId: this.recipientId.getValue(),
      relatedEntityType: this.relatedEntityType,
      relatedEntityId: this.relatedEntityId,
      isRead: this.isRead,
      readAt: this.readAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}