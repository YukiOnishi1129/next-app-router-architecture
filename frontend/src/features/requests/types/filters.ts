import {
  RequestStatus,
  RequestType,
} from '@/external/domain/request/request-status'

export type RequestFilterInput = {
  status?: RequestStatus
  type?: RequestType
  mineOnly?: boolean
  pendingApprovalsOnly?: boolean
}
