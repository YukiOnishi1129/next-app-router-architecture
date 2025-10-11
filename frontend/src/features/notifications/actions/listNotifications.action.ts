'use server'

import { listNotificationsServer } from '@/external/handler/notification/query.server'

import type { ListNotificationsInput } from '@/external/dto/notification'

export async function listNotificationsAction(input?: ListNotificationsInput) {
  return listNotificationsServer(input)
}
