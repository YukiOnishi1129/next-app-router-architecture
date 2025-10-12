import { RequestStatus } from '@/features/requests/types'

export type ReviewerStatus = Extract<RequestStatus, 'APPROVED' | 'REJECTED'>
