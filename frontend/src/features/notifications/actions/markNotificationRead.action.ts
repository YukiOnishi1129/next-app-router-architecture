'use server'

import { markNotificationReadServer } from '@/external/handler/notification/command.server'

import type { MarkNotificationReadInput } from '@/external/dto/notification'

export async function markNotificationReadAction(
  input: MarkNotificationReadInput
) {
  return markNotificationReadServer(input)
}
