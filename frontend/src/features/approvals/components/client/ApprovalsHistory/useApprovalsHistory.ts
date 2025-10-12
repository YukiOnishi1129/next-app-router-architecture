'use client'

import { useMemo } from 'react'

import { useReviewedApprovalsQuery } from '@/features/approvals/hooks/query/useReviewedApprovalsQuery'
import { RequestStatus } from '@/features/requests/types'

import type { ReviewerSummary } from '@/external/dto/request'
import type {
  ReviewerStatus,
  ApprovalsHistoryTab,
} from '@/features/approvals/types'

const TAB_DEFINITIONS: Array<
  Pick<ApprovalsHistoryTab, 'key' | 'label' | 'description'>
> = [
  {
    key: RequestStatus.APPROVED,
    label: 'Approved by me',
    description: 'Requests you have approved.',
  },
  {
    key: RequestStatus.REJECTED,
    label: 'Rejected by me',
    description: 'Requests you have rejected.',
  },
]

type UseApprovalsHistoryParams = {
  status: ReviewerStatus
  summary: ReviewerSummary
}

export const useApprovalsHistory = ({
  status,
  summary,
}: UseApprovalsHistoryParams) => {
  const query = useReviewedApprovalsQuery(status)

  const tabs = useMemo(() => {
    const counts = {
      [RequestStatus.APPROVED]: summary.approved,
      [RequestStatus.REJECTED]: summary.rejected,
    }

    return TAB_DEFINITIONS.map((tab) => ({
      ...tab,
      href: `/approvals/history?status=${tab.key}` as ApprovalsHistoryTab['href'],
      count: counts[tab.key],
      isActive: tab.key === status,
    }))
  }, [status, summary.approved, summary.rejected])

  const items = useMemo(() => {
    if (!query.data) {
      return []
    }
    return query.data.filter((request) => request.status === status)
  }, [query.data, status])

  return {
    tabs,
    items,
    isLoading: query.isLoading,
    isRefetching: query.isFetching,
    error: query.error,
  }
}
