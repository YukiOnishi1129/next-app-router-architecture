'use server'

import { reopenRequestServer } from '@/external/handler/request/command.server'

import type { ReopenRequestInput } from '@/external/dto/request'

export async function reopenRequestAction(input: ReopenRequestInput) {
  return reopenRequestServer(input)
}
