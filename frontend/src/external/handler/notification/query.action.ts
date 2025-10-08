"use server";

import {
  getNotificationPreferencesServer,
  listNotificationsServer,
  type GetNotificationPreferencesResponse,
  type ListNotificationsInput,
  type ListNotificationsResponse,
} from "./query.server";

export async function listNotificationsAction(
  data?: ListNotificationsInput
): Promise<ListNotificationsResponse> {
  return listNotificationsServer(data);
}

export async function getNotificationPreferencesAction(): Promise<GetNotificationPreferencesResponse> {
  return getNotificationPreferencesServer();
}

export type {
  ListNotificationsInput,
  ListNotificationsResponse,
  GetNotificationPreferencesResponse,
} from "./query.server";
