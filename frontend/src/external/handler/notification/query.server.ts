import "server-only";

import { z } from "zod";

import {
  notificationService,
  userManagementService,
  mapNotificationToDto,
} from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { NotificationDto } from "./shared";

const listNotificationsSchema = z.object({
  unreadOnly: z.boolean().default(false),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type ListNotificationsInput = z.input<typeof listNotificationsSchema>;

export type ListNotificationsResponse = {
  success: boolean;
  error?: string;
  notifications?: NotificationDto[];
  total?: number;
  unreadCount?: number;
  limit?: number;
  offset?: number;
};

export type GetNotificationPreferencesResponse = {
  success: boolean;
  error?: string;
  preferences?: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    notificationTypes: Record<string, boolean>;
  };
};

export async function listNotificationsServer(
  data?: ListNotificationsInput
): Promise<ListNotificationsResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = listNotificationsSchema.parse(data ?? {});

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
      notifications: result.notifications.map(mapNotificationToDto),
      total: result.total,
      unreadCount: result.unreadCount,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get notifications",
    };
  }
}

export async function getNotificationPreferencesServer(): Promise<GetNotificationPreferencesResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await userManagementService.findUserById(session.user.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const preferences = await notificationService.getUserPreferences(
      session.user.id
    );
    const typeSet = new Set(preferences.types);

    return {
      success: true,
      preferences: {
        emailNotifications: preferences.emailEnabled,
        inAppNotifications: preferences.inAppEnabled,
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
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get notification preferences",
    };
  }
}
