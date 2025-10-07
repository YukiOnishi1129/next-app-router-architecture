import {
  Request,
  RequestPriority,
  User,
  UserId,
  UserRole,
  Notification,
  NotificationId,
  NotificationType,
} from "@/external/domain";
import { NotificationRepository } from "@/external/repository/NotificationRepository";
import { UserRepository } from "@/external/repository/UserRepository";

export interface NotificationChannel {
  sendNotification(notification: Notification, recipient: User): Promise<void>;
}

export class EmailChannel implements NotificationChannel {
  async sendNotification(
    notification: Notification,
    recipient: User
  ): Promise<void> {
    // Implementation would send actual email
    console.log(
      `Sending email to ${recipient.getEmail().getValue()}: ${notification.getTitle()}`
    );
    // In production, integrate with email service (SendGrid, SES, etc.)
  }
}

export class InAppChannel implements NotificationChannel {
  async sendNotification(
    notification: Notification,
    recipient: User
  ): Promise<void> {
    // In-app notifications are handled by storing in the database
    // The frontend will poll or use websockets to receive them
    console.log(
      `Creating in-app notification for ${recipient.getName()}: ${notification.getTitle()}`
    );
  }
}

export class NotificationService {
  private channels: Map<string, NotificationChannel>;
  private notificationRepository: NotificationRepository;
  private userRepository: UserRepository;

  constructor() {
    // Initialize repositories
    this.notificationRepository = new NotificationRepository();
    this.userRepository = new UserRepository();

    // Initialize notification channels
    this.channels = new Map([
      ["email", new EmailChannel()],
      ["inApp", new InAppChannel()],
    ]);
  }

  /**
   * Notify about new request
   */
  async notifyNewRequest(request: Request): Promise<void> {
    // Get admins to notify
    const admins = await this.getAdmins();

    for (const admin of admins) {
      const notification = Notification.create({
        recipientId: admin.getId().getValue(),
        title: `New Request: ${request.getTitle()}`,
        message: `A new ${request.getPriority()} priority request has been submitted`,
        type: NotificationType.REQUEST_CREATED,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: "REQUEST",
      });

      // Save notification
      await this.notificationRepository.save(notification);

      // Send through channels
      await this.sendNotification(notification, admin, ["email", "inApp"]);
    }
  }

  /**
   * Notify about request status change
   */
  async notifyRequestStatusChange(
    request: Request,
    changedBy: User
  ): Promise<void> {
    // Get requester
    const requester = await this.userRepository.findById(
      request.getRequesterId()
    );
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      );
      return;
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request ${request.getStatus()}`,
      message: `Your request "${request.getTitle()}" has been ${request.getStatus().toLowerCase()} by ${changedBy.getName()}`,
      type: NotificationType.REQUEST_APPROVED,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: "REQUEST",
    });

    // Save notification
    await this.notificationRepository.save(notification);

    // Send through channels
    await this.sendNotification(notification, requester, ["email", "inApp"]);

    // Notify other stakeholders if needed
    if (request.isApproved()) {
      await this.notifyStakeholders(request, notification);
    }
  }

  /**
   * Notify about priority change
   */
  async notifyPriorityChange(
    request: Request,
    oldPriority: RequestPriority
  ): Promise<void> {
    // Get requester
    const requester = await this.userRepository.findById(
      request.getRequesterId()
    );
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      );
      return;
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request Priority Changed`,
      message: `Request "${request.getTitle()}" priority changed from ${oldPriority} to ${request.getPriority()}`,
      type: NotificationType.REQUEST_SUBMITTED,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: "REQUEST",
    });

    // Save notification
    await this.notificationRepository.save(notification);

    // Send through channels (only in-app for priority changes)
    await this.sendNotification(notification, requester, ["inApp"]);

    // If changed to URGENT priority, notify admins
    if (request.getPriority() === "URGENT" && oldPriority !== "URGENT") {
      const admins = await this.getAdmins();
      for (const admin of admins) {
        const adminNotification = Notification.create({
          recipientId: admin.getId().getValue(),
          title: `Urgent Request: ${request.getTitle()}`,
          message: `Request priority has been elevated to URGENT`,
          type: NotificationType.REQUEST_SUBMITTED,
          relatedEntityId: request.getId().getValue(),
          relatedEntityType: "REQUEST",
        });

        await this.notificationRepository.save(adminNotification);
        await this.sendNotification(adminNotification, admin, [
          "email",
          "inApp",
        ]);
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
    // Get all stakeholders
    const recipients = await this.getRequestStakeholders(request);

    for (const recipient of recipients) {
      const notification = Notification.create({
        recipientId: recipient.getId().getValue(),
        title: `Request Cancelled`,
        message: `Request "${request.getTitle()}" has been cancelled. Reason: ${reason}`,
        type: NotificationType.SYSTEM,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: "REQUEST",
      });

      await this.notificationRepository.save(notification);
      await this.sendNotification(notification, recipient, ["email", "inApp"]);
    }
  }

  /**
   * Notify about approaching deadline
   */
  async notifyApproachingDeadline(
    request: Request,
    daysRemaining: number
  ): Promise<void> {
    // Get requester
    const requester = await this.userRepository.findById(
      request.getRequesterId()
    );
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      );
      return;
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request Deadline Approaching`,
      message: `Request "${request.getTitle()}" has ${daysRemaining} days remaining`,
      type: NotificationType.SYSTEM,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: "REQUEST",
    });

    await this.notificationRepository.save(notification);
    await this.sendNotification(notification, requester, ["email", "inApp"]);

    // Also notify admins if request is still pending review
    if (request.isSubmitted() || request.isInReview()) {
      const admins = await this.getAdmins();
      for (const admin of admins) {
        const adminNotification = Notification.create({
          recipientId: admin.getId().getValue(),
          title: `Review Deadline Approaching`,
          message: `Request "${request.getTitle()}" needs review - ${daysRemaining} days remaining`,
          type: NotificationType.SYSTEM,
          relatedEntityId: request.getId().getValue(),
          relatedEntityType: "REQUEST",
        });

        await this.notificationRepository.save(adminNotification);
        await this.sendNotification(adminNotification, admin, ["email"]);
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
    // Send through each channel
    for (const channelName of channelNames) {
      const channel = this.channels.get(channelName);
      if (channel) {
        try {
          await channel.sendNotification(notification, recipient);
        } catch (error) {
          console.error(
            `Failed to send notification through ${channelName}:`,
            error
          );
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
    const recipientId = UserId.create(userId);
    const notifications = await this.notificationRepository.findByRecipientId(
      recipientId,
      limit
    );

    if (unreadOnly) {
      return notifications.filter((n) => !n.getIsRead());
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(
      NotificationId.create(notificationId)
    );

    if (!notification || notification.getRecipientId().getValue() !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId, true);

    for (const notification of notifications) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(
    _userId: string
  ): Promise<NotificationPreferences> {
    // In production, this would fetch from a preferences table
    return {
      email: {
        newRequest: true,
        statusChanged: true,
        requestUpdated: false,
        deadlineReminder: true,
      },
      inApp: {
        newRequest: true,
        statusChanged: true,
        requestUpdated: true,
        deadlineReminder: true,
      },
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    _preferences: NotificationPreferences
  ): Promise<void> {
    // In production, this would update preferences in database
    console.log(`Updating notification preferences for user ${userId}`);
  }

  /**
   * Get admins
   */
  private async getAdmins(): Promise<User[]> {
    // In a production environment, this would query the database with a role filter
    // For now, we'll fetch users individually or implement a custom query
    // TODO: Implement a proper query to fetch admin users from database
    const adminIds: string[] = []; // This should be fetched from configuration or database
    const admins: User[] = [];

    for (const adminId of adminIds) {
      const admin = await this.userRepository.findById(UserId.create(adminId));
      if (admin && admin.isAdmin()) {
        admins.push(admin);
      }
    }

    return admins;
  }

  /**
   * Get request stakeholders
   */
  private async getRequestStakeholders(request: Request): Promise<User[]> {
    const stakeholders: User[] = [];

    // Add requester
    const requester = await this.userRepository.findById(
      request.getRequesterId()
    );
    if (requester) {
      stakeholders.push(requester);
    }

    // Add assignee if exists
    const assigneeId = request.getAssigneeId();
    if (assigneeId) {
      const assignee = await this.userRepository.findById(assigneeId);
      if (assignee) {
        stakeholders.push(assignee);
      }
    }

    // Add admins if request is still pending
    if (request.isSubmitted() || request.isInReview()) {
      const admins = await this.getAdmins();
      stakeholders.push(...admins);
    }

    // Remove duplicates
    const uniqueIds = new Set(stakeholders.map((s) => s.getId().getValue()));
    return stakeholders.filter((s: User) => {
      const id = s.getId().getValue();
      if (uniqueIds.has(id)) {
        uniqueIds.delete(id);
        return true;
      }
      return false;
    });
  }

  /**
   * Notify stakeholders about approved request
   */
  private async notifyStakeholders(
    request: Request,
    _notification: Notification
  ): Promise<void> {
    // In production, this might notify other systems or departments
    console.log(
      `Notifying stakeholders about approved request ${request.getId().getValue()}`
    );
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
