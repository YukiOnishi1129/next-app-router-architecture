'use client'

import { ApprovalsHistoryPresenter } from './ApprovalsHistoryPresenter'
import { useApprovalsHistory } from './useApprovalsHistory'

import type { ReviewerSummary } from '@/external/dto/request'
import type { ReviewerStatus } from '@/features/approvals/types'

type ApprovalsHistoryContainerProps = {
  status: ReviewerStatus
  summary: ReviewerSummary
}

export function ApprovalsHistoryContainer({
  status,
  summary,
}: ApprovalsHistoryContainerProps) {
  const { tabs, items, isLoading, isRefetching, error } = useApprovalsHistory({
    status,
    summary,
  })

  return (
    <ApprovalsHistoryPresenter
      tabs={tabs}
      items={items}
      isLoading={isLoading}
      isRefetching={isRefetching}
      error={error}
    />
  )
}
