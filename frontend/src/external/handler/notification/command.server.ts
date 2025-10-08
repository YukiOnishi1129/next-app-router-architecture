import "server-only";

import { z } from "zod";
import { getSessionServer } from "../auth/query.server";
import { notificationService, userManagementService } from "./shared";

const markNotificationReadSchema = z.object({
  notificationId: z.string(),
});

const markAllNotificationsReadSchema = z.object({
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

export type MarkNotificationReadInput = z.input<
  typeof markNotificationReadSchema
>;
export type MarkAllNotificationsReadInput = z.input<
  typeof markAllNotificationsReadSchema
>;
export type UpdateNotificationPreferencesInput = z.input<
  typeof updatePreferencesSchema
>;

export type NotificationCommandResponse = {
  success: boolean;
  error?: string;
};

export type UpdateNotificationPreferencesResponse = {
  success: boolean;
  error?: string;
  preferences?: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    notificationTypes: Record<string, boolean>;
  };
};

export async function markNotificationReadServer(
  data: MarkNotificationReadInput
): Promise<NotificationCommandResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = markNotificationReadSchema.parse(data);

    await notificationService.markAsRead(
      validated.notificationId,
      session.user.id
    );

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark notification",
    };
  }
}

export async function markAllNotificationsReadServer(
  data?: MarkAllNotificationsReadInput
): Promise<NotificationCommandResponse & { count?: number }> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = markAllNotificationsReadSchema.parse(data ?? {});
    const count = await notificationService.markAllAsRead(
      session.user.id,
      validated.before
    );

    return { success: true, count };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark notifications",
    };
  }
}

export async function updateNotificationPreferencesServer(
  data: UpdateNotificationPreferencesInput
): Promise<UpdateNotificationPreferencesResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updatePreferencesSchema.parse(data);

    const types: string[] = [];
    if (validated.notificationTypes) {
      const typeMap = {
        requestCreated: "request.created",
        requestUpdated: "request.updated",
        requestApproved: "request.approved",
        requestRejected: "request.rejected",
        commentAdded: "comment.added",
        assignmentChanged: "assignment.changed",
      } as const;

      for (const [key, enabled] of Object.entries(
        validated.notificationTypes
      )) {
        if (enabled) {
          types.push(typeMap[key as keyof typeof typeMap]);
        }
      }
    }

    const updated = await notificationService.updateUserPreferences(
      session.user.id,
      {
        emailEnabled: validated.emailNotifications,
        inAppEnabled: validated.inAppNotifications,
        types: types.length > 0 ? types : undefined,
      }
    );

    const typeSet = new Set(updated.types);

    return {
      success: true,
      preferences: {
        emailNotifications: updated.emailEnabled,
        inAppNotifications: updated.inAppEnabled,
        notificationTypes: {
          requestCreated: typeSet.has("request.created"),
          requestUpdated: typeSet.has("request.updated"),
          requestApproved: typeSet.has("request.approved"),
          requestRejected: typeSet.has("request.rejected"),
          commentAdded: typeSet.has("comment.added"),
          assignmentChanged: typeSet.has("assignment.changed"),
        },
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
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

export async function sendTestNotificationServer(
  userId: string
): Promise<NotificationCommandResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const currentUser = await userManagementService.findUserById(
      session.user.id
    );
    if (!currentUser || !currentUser.isAdmin()) {
      return { success: false, error: "Insufficient permissions" };
    }

    const targetUser = await userManagementService.findUserById(userId);
    if (!targetUser) {
      return { success: false, error: "Target user not found" };
    }

    await notificationService.sendTestNotification(targetUser);
    return { success: true };
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
