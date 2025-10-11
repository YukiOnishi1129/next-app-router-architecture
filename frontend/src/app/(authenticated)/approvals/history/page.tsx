import { ApprovalsHistoryPageTemplate } from '@/features/approvals/components/server/ApprovalsHistoryPageTemplate'

import { RequestStatus } from '@/external/domain/request/request-status'

import type { ReviewerStatus } from '@/features/approvals/types'

const VALID_STATUSES: ReviewerStatus[] = [
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
]

const normalizeStatus = (rawStatus: string | undefined): ReviewerStatus => {
  if (!rawStatus) {
    return RequestStatus.APPROVED
  }

  const upper = rawStatus.toUpperCase()
  return (
    VALID_STATUSES.find((status) => status === upper) ?? RequestStatus.APPROVED
  )
}

export default async function ApprovalsHistoryPage(
  props: PageProps<'/approvals/history'>
) {
  const { status } = await props.searchParams
  const normalizedStatus = Array.isArray(status) ? status[0] : status

  return (
    <ApprovalsHistoryPageTemplate status={normalizeStatus(normalizedStatus)} />
  )
}
