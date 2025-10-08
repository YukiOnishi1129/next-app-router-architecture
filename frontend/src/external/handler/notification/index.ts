"use server";

import { NotificationCommandResponse } from "./command.action";
import { ListNotificationsResponse } from "./query.action";

export {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  updateNotificationPreferencesAction,
  sendTestNotificationAction,
} from "./command.action";

export {
  listNotificationsAction,
  getNotificationPreferencesAction,
} from "./query.action";

export {
  markNotificationReadServer,
  markAllNotificationsReadServer,
  updateNotificationPreferencesServer,
  sendTestNotificationServer,
} from "./command.server";

export {
  listNotificationsServer,
  getNotificationPreferencesServer,
} from "./query.server";

// Backwards-compatible aliases
export {
  markNotificationReadAction as markNotificationAsRead,
  markAllNotificationsReadAction as markAllNotificationsAsRead,
  updateNotificationPreferencesAction as updateNotificationPreferences,
  sendTestNotificationAction as sendTestNotification,
} from "./command.action";

export {
  listNotificationsAction as getNotifications,
  getNotificationPreferencesAction as getNotificationPreferences,
} from "./query.action";

export type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  UpdateNotificationPreferencesResponse,
} from "./command.server";

export type {
  ListNotificationsInput,
  ListNotificationsResponse,
  GetNotificationPreferencesResponse,
} from "./query.server";

export type { NotificationCommandResponse } from "./command.server";

export type NotificationResponse = NotificationCommandResponse;
export type NotificationListResponse = ListNotificationsResponse;
