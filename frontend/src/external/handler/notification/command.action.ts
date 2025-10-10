'use server'

import {
  markNotificationReadServer,
  markAllNotificationsReadServer,
  updateNotificationPreferencesServer,
  sendTestNotificationServer,
} from './command.server'

import type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  NotificationCommandResponse,
  UpdateNotificationPreferencesResponse,
  MarkAllNotificationsReadResponse,
} from './command.server'

export async function markNotificationReadAction(
  data: MarkNotificationReadInput
): Promise<NotificationCommandResponse> {
  return markNotificationReadServer(data)
}

export async function markAllNotificationsReadAction(
  data?: MarkAllNotificationsReadInput
): Promise<MarkAllNotificationsReadResponse> {
  return markAllNotificationsReadServer(data)
}

export async function updateNotificationPreferencesAction(
  data: UpdateNotificationPreferencesInput
): Promise<UpdateNotificationPreferencesResponse> {
  return updateNotificationPreferencesServer(data)
}

export async function sendTestNotificationAction(
  accountId: string
): Promise<NotificationCommandResponse> {
  return sendTestNotificationServer(accountId)
}

export type {
  MarkNotificationReadInput,
  MarkAllNotificationsReadInput,
  UpdateNotificationPreferencesInput,
  NotificationCommandResponse,
  UpdateNotificationPreferencesResponse,
  MarkAllNotificationsReadResponse,
} from './command.server'
