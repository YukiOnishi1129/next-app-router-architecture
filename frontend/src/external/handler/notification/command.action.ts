"use server";

import {
  markNotificationReadServer,
  markAllNotificationsReadServer,
  updateNotificationPreferencesServer,
  sendTestNotificationServer,
  type MarkNotificationReadInput,
  type MarkAllNotificationsReadInput,
  type UpdateNotificationPreferencesInput,
  type NotificationCommandResponse,
  type UpdateNotificationPreferencesResponse,
} from "./command.server";

export async function markNotificationReadAction(
  data: MarkNotificationReadInput
): Promise<NotificationCommandResponse> {
  return markNotificationReadServer(data);
}

export async function markAllNotificationsReadAction(
  data?: MarkAllNotificationsReadInput
): Promise<NotificationCommandResponse & { count?: number }> {
  return markAllNotificationsReadServer(data);
}

export async function updateNotificationPreferencesAction(
  data: UpdateNotificationPreferencesInput
): Promise<UpdateNotificationPreferencesResponse> {
  return updateNotificationPreferencesServer(data);
}

export async function sendTestNotificationAction(
  userId: string
): Promise<NotificationCommandResponse> {
  return sendTestNotificationServer(userId);
}

export type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  NotificationCommandResponse,
  UpdateNotificationPreferencesResponse,
} from "./command.server";
