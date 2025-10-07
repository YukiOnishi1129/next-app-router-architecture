"use server";

import { z } from "zod";
import { NotificationService } from "@/external/service/NotificationService";
import { UserManagementService } from "@/external/service";
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

type GetNotificationsInput = z.input<typeof getNotificationsSchema>;
type MarkAsReadInput = z.input<typeof markAsReadSchema>;
type MarkAllAsReadInput = z.input<typeof markAllAsReadSchema>;
type UpdatePreferencesInput = z.input<typeof updatePreferencesSchema>;

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
    metadata?: Record<string, unknown>;
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
const userService = new UserManagementService();

/**
 * Get notifications for current user
 */
export async function getNotifications(
  data?: GetNotificationsInput
): Promise<NotificationListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = getNotificationsSchema.parse(data ?? {});

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
      notifications: result.notifications.map((notification) => ({
        id: notification.getId().getValue(),
        userId: notification.getRecipientId().getValue(),
        type: notification.getType(),
        title: notification.getTitle(),
        message: notification.getMessage(),
        read: notification.getIsRead(),
        createdAt: notification.getCreatedAt().toISOString(),
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
  data: MarkAsReadInput
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

    return {
      success: true,
      notification: {
        id: notification.getId().getValue(),
        userId: notification.getRecipientId().getValue(),
        type: notification.getType(),
        title: notification.getTitle(),
        message: notification.getMessage(),
        read: notification.getIsRead(),
        createdAt: notification.getCreatedAt().toISOString(),
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
export async function markAllNotificationsAsRead(
  data?: MarkAllAsReadInput
): Promise<{
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

    const validated = markAllAsReadSchema.parse(data ?? {});

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

    const user = await userService.findUserById(session.user.id);
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
        notificationTypes: buildPreferenceFlags(preferences.types),
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
  data: UpdatePreferencesInput
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

    const user = await userService.findUserById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

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
        notificationTypes: buildPreferenceFlags(updatedPreferences.types),
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

    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    const targetUser = await userService.findUserById(userId);
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

function buildPreferenceFlags(types: string[]) {
  const typeSet = new Set(types);
  return {
    requestCreated: typeSet.has("request.created"),
    requestUpdated: typeSet.has("request.updated"),
    requestApproved: typeSet.has("request.approved"),
    requestRejected: typeSet.has("request.rejected"),
    commentAdded: typeSet.has("comment.added"),
    assignmentChanged: typeSet.has("assignment.changed"),
  };
}
