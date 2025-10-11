import { z } from 'zod'

import type { RequestDto } from './request.dto'

export const requestListSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export type RequestListInput = z.input<typeof requestListSchema>

export type RequestListResponse = {
  success: boolean
  error?: string
  requests?: RequestDto[]
  total?: number
  limit?: number
  offset?: number
}

export const requestDetailSchema = z.object({
  requestId: z.uuid(),
})

export type RequestDetailInput = z.input<typeof requestDetailSchema>

export type RequestDetailResponse = {
  success: boolean
  error?: string
  request?: RequestDto
}
