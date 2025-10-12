'use client'

import { useMemo } from 'react'

import { useReviewedApprovalsQuery } from '@/features/approvals/hooks/query/useReviewedApprovalsQuery'
import { RequestStatus } from '@/features/requests/types'

import type { ReviewerSummary } from '@/external/dto/request'
import type { ReviewerStatus } from '@/features/approvals/types'
import type { RequestsStatusRoute } from '@/features/requests/types'
type TabDefinition = {
  key: ReviewerStatus
  label: string
  description: string
}

type TabViewModel = TabDefinition & {
  href: RequestsStatusRoute
  count: number
  isActive: boolean
}

const TAB_DEFINITIONS: TabDefinition[] = [
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

  const tabs = useMemo<TabViewModel[]>(() => {
    const counts = {
      [RequestStatus.APPROVED]: summary.approved,
      [RequestStatus.REJECTED]: summary.rejected,
    }

    return TAB_DEFINITIONS.map((tab) => ({
      ...tab,
      href: `/approvals/history?status=${tab.key}` as RequestsStatusRoute,
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
