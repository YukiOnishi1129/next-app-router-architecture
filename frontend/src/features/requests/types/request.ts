import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/external/domain/request/request-status'

export interface RequestSummary {
  id: string
  title: string
  status: RequestStatus
  type: RequestType
  priority: RequestPriority
  createdAt: string
  submittedAt: string | null
}
