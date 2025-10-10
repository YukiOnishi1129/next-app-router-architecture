'use server'

import { createRequestServer } from '@/external/handler/request/command.server'

import type { CreateRequestInput } from '@/features/requests/schemas'

export async function createRequestAction(input: CreateRequestInput) {
  return createRequestServer(input)
}
