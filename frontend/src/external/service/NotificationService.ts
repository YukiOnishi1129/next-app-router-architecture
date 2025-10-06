import { Request } from '@/external/domain/models/Request';
import { User } from '@/external/domain/models/User';
import { Notification } from '@/external/domain/models/Notification';
import { NotificationType } from '@/external/domain/valueobjects/NotificationType';
import { Priority } from '@/external/domain/valueobjects/Priority';
import { NotificationRepository } from '@/external/repository/NotificationRepository';
import { UserRepository } from '@/external/repository/UserRepository';

export interface NotificationChannel {
  sendNotification(notification: Notification, recipient: User): Promise<void>;
}

export class EmailChannel implements NotificationChannel {
  async sendNotification(notification: Notification, recipient: User): Promise<void> {
    // Implementation would send actual email
    console.log(`Sending email to ${recipient.email}: ${notification.title}`);
    // In production, integrate with email service (SendGrid, SES, etc.)
  }
}

export class InAppChannel implements NotificationChannel {
  async sendNotification(notification: Notification, recipient: User): Promise<void> {
    // In-app notifications are handled by storing in the database
    // The frontend will poll or use websockets to receive them
    console.log(`Creating in-app notification for ${recipient.name}: ${notification.title}`);
  }
}

export class NotificationService {
  private channels: Map<string, NotificationChannel>;

  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository
  ) {
    // Initialize notification channels
    this.channels = new Map([
      ['email', new EmailChannel()],
      ['inApp', new InAppChannel()]
    ]);
  }

  /**
   * Notify about new request
   */
  async notifyNewRequest(request: Request): Promise<void> {
    // Get managers and admins to notify
    const approvers = await this.getApprovers();

    const notification = new Notification(
      this.generateId(),
      `New Request: ${request.title}`,
      `A new ${request.priority} priority request has been submitted by ${request.requester.name}`,
      NotificationType.NEW_REQUEST,
      new Date(),
      false,
      {
        requestId: request.id,
        requesterId: request.requester.id,
        priority: request.priority,
        category: request.category
      }
    );

    // Send to all approvers
    for (const approver of approvers) {
      await this.sendNotification(notification, approver, ['email', 'inApp']);
    }
  }

  /**
   * Notify about request status change
   */
  async notifyRequestStatusChange(
    request: Request,
    changedBy: User
  ): Promise<void> {
    const notification = new Notification(
      this.generateId(),
      `Request ${request.status}`,
      `Your request "${request.title}" has been ${request.status.toLowerCase()} by ${changedBy.name}`,
      NotificationType.STATUS_CHANGED,
      new Date(),
      false,
      {
        requestId: request.id,
        newStatus: request.status,
        changedById: changedBy.id
      }
    );

    // Notify requester
    await this.sendNotification(notification, request.requester, ['email', 'inApp']);

    // Notify other stakeholders if needed
    if (request.status === 'APPROVED') {
      await this.notifyStakeholders(request, notification);
    }
  }

  /**
   * Notify about priority change
   */
  async notifyPriorityChange(
    request: Request,
    oldPriority: Priority
  ): Promise<void> {
    const notification = new Notification(
      this.generateId(),
      `Request Priority Changed`,
      `Request "${request.title}" priority changed from ${oldPriority} to ${request.priority}`,
      NotificationType.REQUEST_UPDATED,
      new Date(),
      false,
      {
        requestId: request.id,
        oldPriority,
        newPriority: request.priority
      }
    );

    // Notify requester
    await this.sendNotification(notification, request.requester, ['inApp']);

    // If changed to HIGH priority, notify approvers
    if (request.priority === Priority.HIGH && oldPriority !== Priority.HIGH) {
      const approvers = await this.getApprovers();
      for (const approver of approvers) {
        await this.sendNotification(notification, approver, ['email', 'inApp']);
      }
    }
  }

  /**
   * Notify about request cancellation
   */
  async notifyRequestCancelled(
    request: Request,
    reason: string
  ): Promise<void> {
    const notification = new Notification(
      this.generateId(),
      `Request Cancelled`,
      `Request "${request.title}" has been cancelled. Reason: ${reason}`,
      NotificationType.REQUEST_CANCELLED,
      new Date(),
      false,
      {
        requestId: request.id,
        cancellationReason: reason
      }
    );

    // Notify all involved parties
    const recipients = await this.getRequestStakeholders(request);
    for (const recipient of recipients) {
      await this.sendNotification(notification, recipient, ['email', 'inApp']);
    }
  }

  /**
   * Notify about approaching deadline
   */
  async notifyApproachingDeadline(
    request: Request,
    daysRemaining: number
  ): Promise<void> {
    const notification = new Notification(
      this.generateId(),
      `Request Deadline Approaching`,
      `Request "${request.title}" has ${daysRemaining} days remaining`,
      NotificationType.DEADLINE_REMINDER,
      new Date(),
      false,
      {
        requestId: request.id,
        daysRemaining
      }
    );

    // Notify requester and approvers
    await this.sendNotification(notification, request.requester, ['email', 'inApp']);
    
    if (request.status === 'PENDING') {
      const approvers = await this.getApprovers();
      for (const approver of approvers) {
        await this.sendNotification(notification, approver, ['email']);
      }
    }
  }

  /**
   * Send notification through specified channels
   */
  private async sendNotification(
    notification: Notification,
    recipient: User,
    channelNames: string[]
  ): Promise<void> {
    // Save notification to database
    await this.notificationRepository.save({
      ...notification,
      recipientId: recipient.id
    });

    // Send through each channel
    for (const channelName of channelNames) {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          await channel.sendNotification(notification, recipient);
        } catch (error) {
          console.error(`Failed to send notification through ${channelName}:`, error);
        }
      }
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit?: number
  ): Promise<Notification[]> {
    return this.notificationRepository.findByRecipient(userId, unreadOnly, limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    
    if (!notification || notification.recipientId !== userId) {
      throw new Error('Notification not found');
    }

    const updatedNotification = new Notification(
      notification.id,
      notification.title,
      notification.message,
      notification.type,
      notification.createdAt,
      true, // Mark as read
      notification.metadata
    );

    await this.notificationRepository.save({
      ...updatedNotification,
      recipientId: userId
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.notificationRepository.findByRecipient(userId, true);
    
    for (const notification of notifications) {
      await this.markAsRead(notification.id, userId);
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    // In production, this would fetch from a preferences table
    return {
      email: {
        newRequest: true,
        statusChanged: true,
        requestUpdated: false,
        deadlineReminder: true
      },
      inApp: {
        newRequest: true,
        statusChanged: true,
        requestUpdated: true,
        deadlineReminder: true
      }
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    // In production, this would update preferences in database
    console.log(`Updating notification preferences for user ${userId}`);
  }

  /**
   * Get approvers (managers and admins)
   */
  private async getApprovers(): Promise<User[]> {
    const managers = await this.userRepository.findByRole('MANAGER');
    const admins = await this.userRepository.findByRole('ADMIN');
    return [...managers, ...admins];
  }

  /**
   * Get request stakeholders
   */
  private async getRequestStakeholders(request: Request): Promise<User[]> {
    const stakeholders: User[] = [request.requester];
    
    // Add approvers if request is still pending
    if (request.status === 'PENDING') {
      const approvers = await this.getApprovers();
      stakeholders.push(...approvers);
    }

    return stakeholders;
  }

  /**
   * Notify stakeholders about approved request
   */
  private async notifyStakeholders(
    request: Request,
    notification: Notification
  ): Promise<void> {
    // In production, this might notify other systems or departments
    console.log(`Notifying stakeholders about approved request ${request.id}`);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface NotificationPreferences {
  email: {
    newRequest: boolean;
    statusChanged: boolean;
    requestUpdated: boolean;
    deadlineReminder: boolean;
  };
  inApp: {
    newRequest: boolean;
    statusChanged: boolean;
    requestUpdated: boolean;
    deadlineReminder: boolean;
  };
}