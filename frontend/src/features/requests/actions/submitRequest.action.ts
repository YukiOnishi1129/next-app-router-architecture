'use server'

import { submitRequestServer } from '@/external/handler/request/command.server'

import type { SubmitRequestInput } from '@/external/dto/request'

export async function submitRequestAction(input: SubmitRequestInput) {
  return submitRequestServer(input)
}
