import {
  RequestStatus,
  RequestType,
} from '@/external/domain/request/request-status'

export type ReviewerStatus = Extract<RequestStatus, 'APPROVED' | 'REJECTED'>

export type RequestFilterInput = {
  status?: RequestStatus
  type?: RequestType
  mineOnly?: boolean
  pendingApprovalsOnly?: boolean
}
