import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

export type PendingApproval = {
  id: string
  title: string
  status: RequestStatus
  type: RequestType
  priority: RequestPriority
  requesterName: string | null
  submittedAt: string | null
}
