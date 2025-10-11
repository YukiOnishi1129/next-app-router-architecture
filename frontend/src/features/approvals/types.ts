import { RequestStatus } from '@/external/domain/request/request-status'

export type ReviewerStatus = Extract<RequestStatus, 'APPROVED' | 'REJECTED'>

export type { PendingApproval } from './types/pendingApproval'
