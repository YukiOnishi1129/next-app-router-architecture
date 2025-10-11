export {
  RequestStatus,
  RequestType,
  RequestPriority,
} from '@/external/domain/request/request-status'

export const REQUEST_STATUS_VALUES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
] as const

export type RequestStatusValue = (typeof REQUEST_STATUS_VALUES)[number]
