"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

import {
  getNotificationPreferencesServer,
  listNotificationsServer,
} from "./query.server";

import type {
  GetNotificationPreferencesResponse,
  ListNotificationsInput,
  ListNotificationsResponse,
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
