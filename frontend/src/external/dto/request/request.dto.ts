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
  assigneeId?: string | null
  createdAt: string
  updatedAt: string
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewerId?: string | null
}
