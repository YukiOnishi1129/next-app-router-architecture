import { RequestPriority, RequestStatus, RequestType } from './status'

export interface RequestSummary {
  id: string
  title: string
  status: RequestStatus
  type: RequestType
  priority: RequestPriority
  createdAt: string
  submittedAt: string | null
}

export interface RequestDetail extends RequestSummary {
  description: string
  requesterId: string
  requesterName: string | null
  assigneeId: string | null
  assigneeName: string | null
  updatedAt: string
  reviewedAt: string | null
  reviewerId: string | null
  reviewerName: string | null
}
