import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/external/domain/request/request-status'

export type RequestDto = {
  id: string
  title: string
  description: string
  type: RequestType
  priority: RequestPriority
  status: RequestStatus
  requesterId: string
  requesterName?: string | null
  assigneeId?: string | null
  assigneeName?: string | null
  createdAt: string
  updatedAt: string
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewerId?: string | null
  reviewerName?: string | null
}

export type PendingApprovalDto = {
  id: string
  title: string
  status: RequestStatus
  type: RequestType
  priority: RequestPriority
  requesterName: string | null
  submittedAt: string | null
}
