import type { ReviewerStatus } from '@/features/approvals/types'
import type { RequestsStatusRoute } from '@/features/requests/types'

export type ApprovalsHistoryTab = {
  key: ReviewerStatus
  label: string
  description: string
  count: number
  href: RequestsStatusRoute
  isActive: boolean
}
