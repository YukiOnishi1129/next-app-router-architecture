"use server";

import { z } from "zod";
import { NotificationService } from "@/external/service/NotificationService";
import { UserRepository } from "@/external/domain";
import { getSession } from "./auth";

// Validation schemas
const getNotificationsSchema = z.object({
  unreadOnly: z.boolean().default(false),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const markAsReadSchema = z.object({
  notificationId: z.string(),
});

const markAllAsReadSchema = z.object({
  before: z.date().optional(),
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  notificationTypes: z
    .object({
      requestCreated: z.boolean().optional(),
      requestUpdated: z.boolean().optional(),
      requestApproved: z.boolean().optional(),
      requestRejected: z.boolean().optional(),
      commentAdded: z.boolean().optional(),
      assignmentChanged: z.boolean().optional(),
    })
    .optional(),
});

// Response types
export type NotificationResponse = {
  success: boolean;
  error?: string;
  notification?: {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    read: boolean;
    createdAt: string;
  };
};

export type NotificationListResponse = {
  success: boolean;
  error?: string;
  notifications?: Array<NotificationResponse["notification"]>;
  total?: number;
  unreadCount?: number;
  limit?: number;
  offset?: number;
};

export type NotificationPreferencesResponse = {
  success: boolean;
  error?: string;
  preferences?: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    notificationTypes: {
      requestCreated: boolean;
      requestUpdated: boolean;
      requestApproved: boolean;
      requestRejected: boolean;
      commentAdded: boolean;
      assignmentChanged: boolean;
    };
  };
};

// Initialize services
const notificationService = new NotificationService();
const userRepository = new UserRepository();

/**
 * Get notifications for current user
 */
export async function getNotifications(
  data?: unknown
): Promise<NotificationListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = getNotificationsSchema.parse(data || {});

    // Get notifications from service
    const result = await notificationService.getUserNotifications(
      session.user.id,
      {
        unreadOnly: validated.unreadOnly,
        limit: validated.limit,
        offset: validated.offset,
      }
    );

    return {
      success: true,
      notifications: result.notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      total: result.total,
      unreadCount: result.unreadCount,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get notifications",
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  data: unknown
): Promise<NotificationResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = markAsReadSchema.parse(data);

    const notification = await notificationService.markAsRead(
      validated.notificationId,
      session.user.id
    );

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    return {
      success: true,
      notification: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(data?: unknown): Promise<{
  success: boolean;
  error?: string;
  count?: number;
}> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = markAllAsReadSchema.parse(data || {});

    const count = await notificationService.markAllAsRead(
      session.user.id,
      validated.before
    );

    return {
      success: true,
      count,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read",
    };
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const preferences = await notificationService.getUserPreferences(
      session.user.id
    );

    return {
      success: true,
      preferences: {
        emailNotifications: preferences.emailEnabled,
        inAppNotifications: preferences.inAppEnabled,
        notificationTypes: {
          requestCreated: preferences.types.includes("request.created"),
          requestUpdated: preferences.types.includes("request.updated"),
          requestApproved: preferences.types.includes("request.approved"),
          requestRejected: preferences.types.includes("request.rejected"),
          commentAdded: preferences.types.includes("comment.added"),
          assignmentChanged: preferences.types.includes("assignment.changed"),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get notification preferences",
    };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  data: unknown
): Promise<NotificationPreferencesResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updatePreferencesSchema.parse(data);

    // Build notification types array
    const types: string[] = [];
    if (validated.notificationTypes) {
      const typeMap = {
        requestCreated: "request.created",
        requestUpdated: "request.updated",
        requestApproved: "request.approved",
        requestRejected: "request.rejected",
        commentAdded: "comment.added",
        assignmentChanged: "assignment.changed",
      };

      Object.entries(validated.notificationTypes).forEach(([key, enabled]) => {
        if (enabled && key in typeMap) {
          types.push(typeMap[key as keyof typeof typeMap]);
        }
      });
    }

    const updatedPreferences = await notificationService.updateUserPreferences(
      session.user.id,
      {
        emailEnabled: validated.emailNotifications,
        inAppEnabled: validated.inAppNotifications,
        types: types.length > 0 ? types : undefined,
      }
    );

    return {
      success: true,
      preferences: {
        emailNotifications: updatedPreferences.emailEnabled,
        inAppNotifications: updatedPreferences.inAppEnabled,
        notificationTypes: {
          requestCreated: updatedPreferences.types.includes("request.created"),
          requestUpdated: updatedPreferences.types.includes("request.updated"),
          requestApproved:
            updatedPreferences.types.includes("request.approved"),
          requestRejected:
            updatedPreferences.types.includes("request.rejected"),
          commentAdded: updatedPreferences.types.includes("comment.added"),
          assignmentChanged:
            updatedPreferences.types.includes("assignment.changed"),
        },
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update notification preferences",
    };
  }
}

/**
 * Send test notification (admin only)
 */
export async function sendTestNotification(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      return {
        success: false,
        error: "Target user not found",
      };
    }

    await notificationService.sendTestNotification(targetUser);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send test notification",
    };
  }
}
