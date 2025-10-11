import { z } from 'zod'

import { RequestStatus } from '@/external/domain/request/request-status'

import type { PendingApprovalDto, RequestDto } from './request.dto'
import type { AuditLogDto } from '@/external/dto/audit'
import type { NotificationDto } from '@/external/dto/notification'

export const requestListSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: z.nativeEnum(RequestStatus).optional(),
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

const reviewerStatuses = [
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
] as const

export const reviewerRequestListSchema = requestListSchema.extend({
  status: z.enum(reviewerStatuses).optional(),
})

export type ReviewerRequestListInput = z.input<typeof reviewerRequestListSchema>

export const requestDetailSchema = z.object({
  requestId: z.uuid(),
})

export type RequestDetailInput = z.input<typeof requestDetailSchema>

export type RequestDetailResponse = {
  success: boolean
  error?: string
  request?: RequestDto
}

export const requestHistorySchema = z.object({
  requestId: z.uuid(),
})

export type RequestHistoryInput = z.input<typeof requestHistorySchema>

export type RequestHistoryResponse = {
  success: boolean
  error?: string
  auditLogs?: AuditLogDto[]
  notifications?: NotificationDto[]
}

export type PendingApprovalListResponse = {
  success: boolean
  error?: string
  requests?: PendingApprovalDto[]
}

export type RequestSummaryStatusEntry = {
  status: RequestStatus
  count: number
}

export type RequestSummary = {
  total: number
  byStatus: RequestSummaryStatusEntry[]
}

export type RequestSummaryResponse = {
  success: boolean
  error?: string
  summary?: RequestSummary
}

export type ReviewerSummary = {
  approved: number
  rejected: number
}

export type ReviewerSummaryResponse = {
  success: boolean
  error?: string
  summary?: ReviewerSummary
}
