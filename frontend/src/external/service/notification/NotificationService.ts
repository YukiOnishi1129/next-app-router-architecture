import {
  Request,
  RequestPriority,
  Comment,
  Account,
  AccountId,
  Notification,
  NotificationId,
  NotificationType,
} from '@/external/domain'
import {
  NotificationRepository,
  AccountRepository,
} from '@/external/repository'

export interface NotificationChannel {
  sendNotification(
    notification: Notification,
    recipient: Account
  ): Promise<void>
}

export interface NotificationPreferences {
  emailEnabled: boolean
  inAppEnabled: boolean
  types: string[]
}

const DEFAULT_NOTIFICATION_TYPES = [
  'request.created',
  'request.updated',
  'request.approved',
  'request.rejected',
  'comment.added',
  'assignment.changed',
]

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  types: [...DEFAULT_NOTIFICATION_TYPES],
}

export class EmailChannel implements NotificationChannel {
  async sendNotification(
    notification: Notification,
    recipient: Account
  ): Promise<void> {
    // Implementation would send actual email
    console.log(
      `Sending email to ${recipient.getEmail().getValue()}: ${notification.getTitle()}`
    )
    // In production, integrate with email service (SendGrid, SES, etc.)
  }
}

export class InAppChannel implements NotificationChannel {
  async sendNotification(
    notification: Notification,
    recipient: Account
  ): Promise<void> {
    // In-app notifications are handled by storing in the database
    // The frontend will poll or use websockets to receive them
    console.log(
      `Creating in-app notification for ${recipient.getName()}: ${notification.getTitle()}`
    )
  }
}

export class NotificationService {
  private channels: Map<string, NotificationChannel>
  private notificationRepository: NotificationRepository
  private accountRepository: AccountRepository
  private accountPreferences: Map<string, NotificationPreferences>

  constructor() {
    // Initialize repositories
    this.notificationRepository = new NotificationRepository()
    this.accountRepository = new AccountRepository()

    // Initialize notification channels
    this.channels = new Map([
      ['email', new EmailChannel()],
      ['inApp', new InAppChannel()],
    ])

    this.accountPreferences = new Map()
  }

  /**
   * Notify about new request
   */
  async notifyNewRequest(request: Request): Promise<void> {
    // Get admins to notify
    const admins = await this.getAdmins()

    for (const admin of admins) {
      const notification = Notification.create({
        recipientId: admin.getId().getValue(),
        title: `New Request: ${request.getTitle()}`,
        message: `A new ${request.getPriority()} priority request has been submitted`,
        type: NotificationType.REQUEST_CREATED,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: 'REQUEST',
      })

      // Save notification
      await this.notificationRepository.save(notification)

      // Send through channels
      await this.sendNotification(notification, admin, ['email', 'inApp'])
    }
  }

  /**
   * Notify about request status change
   */
  async notifyRequestStatusChange(
    request: Request,
    changedBy: Account
  ): Promise<void> {
    // Get requester
    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      )
      return
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request ${request.getStatus()}`,
      message: `Your request "${request.getTitle()}" has been ${request.getStatus().toLowerCase()} by ${changedBy.getName()}`,
      type: NotificationType.REQUEST_APPROVED,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: 'REQUEST',
    })

    // Save notification
    await this.notificationRepository.save(notification)

    // Send through channels
    await this.sendNotification(notification, requester, ['email', 'inApp'])

    // Notify other stakeholders if needed
    if (request.isApproved()) {
      await this.notifyStakeholders(request, notification)
    }
  }

  /**
   * Notify admins that a requester reopened a previously rejected request
   */
  async notifyRequestReopened(request: Request): Promise<void> {
    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    const requesterName = requester?.getName() ?? 'Requester'
    const admins = await this.getAdmins()
    if (!admins.length) {
      return
    }

    for (const admin of admins) {
      const notification = Notification.create({
        recipientId: admin.getId().getValue(),
        title: `Request reopened: ${request.getTitle()}`,
        message: `${requesterName} reopened their request "${request.getTitle()}" for updates.`,
        type: NotificationType.REQUEST_SUBMITTED,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: 'REQUEST',
      })

      await this.notificationRepository.save(notification)
      await this.sendNotification(notification, admin, ['email', 'inApp'])
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
    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      )
      return
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request Priority Changed`,
      message: `Request "${request.getTitle()}" priority changed from ${oldPriority} to ${request.getPriority()}`,
      type: NotificationType.REQUEST_SUBMITTED,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: 'REQUEST',
    })

    // Save notification
    await this.notificationRepository.save(notification)

    // Send through channels (only in-app for priority changes)
    await this.sendNotification(notification, requester, ['inApp'])

    // If changed to URGENT priority, notify admins
    if (request.getPriority() === 'URGENT' && oldPriority !== 'URGENT') {
      const admins = await this.getAdmins()
      for (const admin of admins) {
        const adminNotification = Notification.create({
          recipientId: admin.getId().getValue(),
          title: `Urgent Request: ${request.getTitle()}`,
          message: `Request priority has been elevated to URGENT`,
          type: NotificationType.REQUEST_SUBMITTED,
          relatedEntityId: request.getId().getValue(),
          relatedEntityType: 'REQUEST',
        })

        await this.notificationRepository.save(adminNotification)
        await this.sendNotification(adminNotification, admin, [
          'email',
          'inApp',
        ])
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
    const recipients = await this.getRequestStakeholders(request)

    for (const recipient of recipients) {
      const notification = Notification.create({
        recipientId: recipient.getId().getValue(),
        title: `Request Cancelled`,
        message: `Request "${request.getTitle()}" has been cancelled. Reason: ${reason}`,
        type: NotificationType.SYSTEM,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: 'REQUEST',
      })

      await this.notificationRepository.save(notification)
      await this.sendNotification(notification, recipient, ['email', 'inApp'])
    }
  }

  /**
   * Notify assignee about new assignment
   */
  async notifyAssignment(request: Request): Promise<void> {
    const assigneeId = request.getAssigneeId()
    if (!assigneeId) {
      return
    }

    const assignee = await this.accountRepository.findById(assigneeId)
    if (!assignee) {
      console.error(`Assignee not found: ${assigneeId.getValue()}`)
      return
    }

    const notification = Notification.create({
      recipientId: assignee.getId().getValue(),
      title: `Request Assigned`,
      message: `You have been assigned to request "${request.getTitle()}"`,
      type: NotificationType.REQUEST_ASSIGNED,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: 'REQUEST',
    })

    await this.notificationRepository.save(notification)
    await this.sendNotification(notification, assignee, ['email', 'inApp'])
  }

  /**
   * Notify request stakeholders about new comment
   */
  async notifyCommentAdded(
    request: Request,
    comment: Comment,
    author: Account,
    additionalRecipientIds: string[] = []
  ): Promise<void> {
    const recipients = new Map<string, Account>()

    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    if (
      requester &&
      requester.getId().getValue() !== author.getId().getValue()
    ) {
      recipients.set(requester.getId().getValue(), requester)
    }

    const assigneeId = request.getAssigneeId()
    if (assigneeId) {
      const assignee = await this.accountRepository.findById(assigneeId)
      if (
        assignee &&
        assignee.getId().getValue() !== author.getId().getValue()
      ) {
        recipients.set(assignee.getId().getValue(), assignee)
      }
    }

    for (const recipientId of additionalRecipientIds) {
      if (recipientId === author.getId().getValue()) {
        continue
      }
      if (!recipients.has(recipientId)) {
        const user = await this.accountRepository.findById(
          AccountId.create(recipientId)
        )
        if (user) {
          recipients.set(recipientId, user)
        }
      }
    }

    for (const recipient of recipients.values()) {
      const notification = Notification.create({
        recipientId: recipient.getId().getValue(),
        title: `New Comment on "${request.getTitle()}"`,
        message: `${author.getName()} commented: ${comment
          .getContent()
          .getValue()}`,
        type: NotificationType.COMMENT_ADDED,
        relatedEntityId: request.getId().getValue(),
        relatedEntityType: 'REQUEST',
      })

      await this.notificationRepository.save(notification)
      await this.sendNotification(notification, recipient, ['inApp', 'email'])
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
    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    if (!requester) {
      console.error(
        `Requester not found: ${request.getRequesterId().getValue()}`
      )
      return
    }

    const notification = Notification.create({
      recipientId: requester.getId().getValue(),
      title: `Request Deadline Approaching`,
      message: `Request "${request.getTitle()}" has ${daysRemaining} days remaining`,
      type: NotificationType.SYSTEM,
      relatedEntityId: request.getId().getValue(),
      relatedEntityType: 'REQUEST',
    })

    await this.notificationRepository.save(notification)
    await this.sendNotification(notification, requester, ['email', 'inApp'])

    // Also notify admins if request is still pending review
    if (request.isSubmitted() || request.isInReview()) {
      const admins = await this.getAdmins()
      for (const admin of admins) {
        const adminNotification = Notification.create({
          recipientId: admin.getId().getValue(),
          title: `Review Deadline Approaching`,
          message: `Request "${request.getTitle()}" needs review - ${daysRemaining} days remaining`,
          type: NotificationType.SYSTEM,
          relatedEntityId: request.getId().getValue(),
          relatedEntityType: 'REQUEST',
        })

        await this.notificationRepository.save(adminNotification)
        await this.sendNotification(adminNotification, admin, ['email'])
      }
    }
  }

  /**
   * Send notification through specified channels
   */
  private async sendNotification(
    notification: Notification,
    recipient: Account,
    channelNames: string[]
  ): Promise<void> {
    // Send through each channel
    for (const channelName of channelNames) {
      const channel = this.channels.get(channelName)
      if (channel) {
        try {
          await channel.sendNotification(notification, recipient)
        } catch (error) {
          console.error(
            `Failed to send notification through ${channelName}:`,
            error
          )
        }
      }
    }
  }

  /**
   * Get user's notifications
   */
  async getAccountNotifications(
    accountId: string,
    options: {
      unreadOnly?: boolean
      limit?: number
      offset?: number
    } = {}
  ): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
  }> {
    const { unreadOnly = false, limit, offset } = options
    const recipientId = AccountId.create(accountId)
    const allNotifications =
      await this.notificationRepository.findByRecipientId(recipientId)

    const filtered = unreadOnly
      ? allNotifications.filter((n) => !n.getIsRead())
      : allNotifications

    const start = offset ?? 0
    const end = limit !== undefined ? start + limit : undefined
    const paginated = filtered.slice(start, end)

    const unreadCount = allNotifications.filter((n) => !n.getIsRead()).length

    return {
      notifications: paginated,
      total: filtered.length,
      unreadCount,
    }
  }

  /**
   * Get notifications related to a specific request
   */
  async getNotificationsForRequest(requestId: string): Promise<Notification[]> {
    return this.notificationRepository.findByRelatedEntity('REQUEST', requestId)
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    accountId: string
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findById(
      NotificationId.create(notificationId)
    )

    if (
      !notification ||
      notification.getRecipientId().getValue() !== accountId
    ) {
      throw new Error('Notification not found or unauthorized')
    }

    notification.markAsRead()
    await this.notificationRepository.save(notification)

    return notification
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(accountId: string, before?: Date): Promise<number> {
    const notifications = await this.notificationRepository.findByRecipientId(
      AccountId.create(accountId)
    )

    let updatedCount = 0
    for (const notification of notifications) {
      if (before && notification.getCreatedAt().getTime() > before.getTime()) {
        continue
      }

      if (!notification.getIsRead()) {
        notification.markAsRead()
        await this.notificationRepository.save(notification)
        updatedCount += 1
      }
    }

    return updatedCount
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(
    _accountId: string
  ): Promise<NotificationPreferences> {
    // Deprecated method retained for backward compatibility
    return DEFAULT_NOTIFICATION_PREFERENCES
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    accountId: string,
    _preferences: NotificationPreferences
  ): Promise<NotificationPreferences> {
    // Deprecated method retained for backward compatibility
    return this.updateAccountPreferences(accountId, _preferences)
  }

  /**
   * Get user notification preferences with defaults
   */
  async getAccountPreferences(
    accountId: string
  ): Promise<NotificationPreferences> {
    const stored = this.accountPreferences.get(accountId)
    if (stored) {
      return { ...stored, types: [...stored.types] }
    }
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      types: [...DEFAULT_NOTIFICATION_TYPES],
    }
  }

  /**
   * Update user notification preferences and persist in-memory
   */
  async updateAccountPreferences(
    accountId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.getAccountPreferences(accountId)
    const updated: NotificationPreferences = {
      emailEnabled: preferences.emailEnabled ?? current.emailEnabled,
      inAppEnabled: preferences.inAppEnabled ?? current.inAppEnabled,
      types: preferences.types ? [...preferences.types] : [...current.types],
    }

    this.accountPreferences.set(accountId, updated)
    return updated
  }

  /**
   * Send a test notification to verify channels
   */
  async sendTestNotification(user: Account): Promise<void> {
    const notification = Notification.create({
      recipientId: user.getId().getValue(),
      title: 'Test Notification',
      message: 'This is a test notification.',
      type: NotificationType.SYSTEM,
      relatedEntityType: 'SYSTEM',
      relatedEntityId: 'test',
    })

    await this.notificationRepository.save(notification)
    await this.sendNotification(notification, user, ['email', 'inApp'])
  }

  /**
   * Get admins
   */
  private async getAdmins(): Promise<Account[]> {
    // In a production environment, this would query the database with a role filter
    // For now, we'll fetch users individually or implement a custom query
    // TODO: Implement a proper query to fetch admin users from database
    const adminIds: string[] = [] // This should be fetched from configuration or database
    const admins: Account[] = []

    for (const adminId of adminIds) {
      const admin = await this.accountRepository.findById(
        AccountId.create(adminId)
      )
      if (admin && admin.isAdmin()) {
        admins.push(admin)
      }
    }

    return admins
  }

  /**
   * Get request stakeholders
   */
  private async getRequestStakeholders(request: Request): Promise<Account[]> {
    const stakeholders: Account[] = []

    // Add requester
    const requester = await this.accountRepository.findById(
      request.getRequesterId()
    )
    if (requester) {
      stakeholders.push(requester)
    }

    // Add assignee if exists
    const assigneeId = request.getAssigneeId()
    if (assigneeId) {
      const assignee = await this.accountRepository.findById(assigneeId)
      if (assignee) {
        stakeholders.push(assignee)
      }
    }

    // Add admins if request is still pending
    if (request.isSubmitted() || request.isInReview()) {
      const admins = await this.getAdmins()
      stakeholders.push(...admins)
    }

    // Remove duplicates
    const uniqueIds = new Set(stakeholders.map((s) => s.getId().getValue()))
    return stakeholders.filter((s: Account) => {
      const id = s.getId().getValue()
      if (uniqueIds.has(id)) {
        uniqueIds.delete(id)
        return true
      }
      return false
    })
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
    )
  }
}
