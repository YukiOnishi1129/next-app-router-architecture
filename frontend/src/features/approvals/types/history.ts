import type { ReviewerStatus } from './reviewer'
import type { Route } from 'next'

type ApprovalsHistoryRoute =
  Route<`/approvals/history?status=${'APPROVED' | 'REJECTED'}`>

export type ApprovalsHistoryTab = {
  key: ReviewerStatus
  label: string
  description: string
  count: number
  href: ApprovalsHistoryRoute
  isActive: boolean
}
