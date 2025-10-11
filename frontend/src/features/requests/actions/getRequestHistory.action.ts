'use server'

import { getRequestHistoryServer } from '@/external/handler/request/query.server'

import type { RequestHistoryInput } from '@/external/dto/request'

export async function getRequestHistoryAction(input: RequestHistoryInput) {
  return getRequestHistoryServer(input)
}
