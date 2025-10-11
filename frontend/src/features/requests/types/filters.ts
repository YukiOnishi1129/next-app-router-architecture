import { RequestStatus, RequestType } from './status'

export type ReviewerStatus = Extract<RequestStatus, 'APPROVED' | 'REJECTED'>

export type RequestFilterInput = {
  status?: RequestStatus
  type?: RequestType
  mineOnly?: boolean
  pendingApprovalsOnly?: boolean
}
