'use server'

import { updateRequestServer } from '@/external/handler/request/command.server'

import type { UpdateRequestInput } from '@/external/dto/request'

export async function updateRequestAction(input: UpdateRequestInput) {
  return updateRequestServer(input)
}
