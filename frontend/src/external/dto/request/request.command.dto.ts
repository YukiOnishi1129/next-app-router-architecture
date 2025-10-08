import { z } from 'zod'

import {
  RequestPriority,
  RequestType,
} from '@/external/domain/request/request-status'

import type { RequestDto } from './request.dto'

export const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(RequestType),
  priority: z.nativeEnum(RequestPriority),
  assigneeId: z.string().optional(),
})

export const updateRequestSchema = z.object({
  requestId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(RequestType),
  priority: z.nativeEnum(RequestPriority),
})

export const submitRequestSchema = z.object({
  requestId: z.string(),
})

export const reviewRequestSchema = z.object({
  requestId: z.string(),
})

export const approveRequestSchema = z.object({
  requestId: z.string(),
  comments: z.string().optional(),
})

export const rejectRequestSchema = z.object({
  requestId: z.string(),
  reason: z.string().min(1),
})

export const cancelRequestSchema = z.object({
  requestId: z.string(),
  reason: z.string().min(1).optional(),
})

export const assignRequestSchema = z.object({
  requestId: z.string(),
  assigneeId: z.string(),
})

export type CreateRequestInput = z.input<typeof createRequestSchema>
export type UpdateRequestInput = z.input<typeof updateRequestSchema>
export type SubmitRequestInput = z.input<typeof submitRequestSchema>
export type ReviewRequestInput = z.input<typeof reviewRequestSchema>
export type ApproveRequestInput = z.input<typeof approveRequestSchema>
export type RejectRequestInput = z.input<typeof rejectRequestSchema>
export type CancelRequestInput = z.input<typeof cancelRequestSchema>
export type AssignRequestInput = z.input<typeof assignRequestSchema>

export type RequestCommandResponse = {
  success: boolean
  error?: string
  request?: RequestDto
}
