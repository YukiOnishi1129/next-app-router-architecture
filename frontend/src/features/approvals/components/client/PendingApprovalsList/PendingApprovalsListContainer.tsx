'use client'

import { useMemo } from 'react'

import { PendingApprovalCard } from '@/features/approvals/components/client/PendingApprovalCard'

import { PendingApprovalsListPresenter } from './PendingApprovalsListPresenter'
import { usePendingApprovals } from './usePendingApprovals'

export function PendingApprovalsListContainer() {
  const {
    approvals,
    isLoading,
    isRefetching,
    errorMessage,
    successMessage,
    handleActionComplete,
  } = usePendingApprovals()

  const cards = useMemo(
    () =>
      approvals.map((approval) => (
        <PendingApprovalCard
          key={approval.id}
          approval={approval}
          onActionComplete={handleActionComplete}
        />
      )),
    [approvals, handleActionComplete]
  )

  return (
    <PendingApprovalsListPresenter
      cards={cards}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  )
}
