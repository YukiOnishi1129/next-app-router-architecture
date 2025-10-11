'use client'

import { PendingApprovalCardPresenter } from './PendingApprovalCardPresenter'
import { usePendingApprovalCard } from './usePendingApprovalCard'

import type { PendingApproval } from '@/features/approvals/types'

type PendingApprovalCardContainerProps = {
  approval: PendingApproval
  onActionComplete: (type: 'approve' | 'reject') => void
}

export function PendingApprovalCardContainer({
  approval,
  onActionComplete,
}: PendingApprovalCardContainerProps) {
  const {
    showRejectForm,
    rejectReason,
    rejectFormError,
    isApproving,
    isRejecting,
    errorMessage,
    successState,
    handleApprove,
    handleToggleReject,
    handleRejectReasonChange,
    handleRejectSubmit,
  } = usePendingApprovalCard({ approval, onActionComplete })

  return (
    <PendingApprovalCardPresenter
      approval={approval}
      showRejectForm={showRejectForm}
      rejectReason={rejectReason}
      rejectFormError={rejectFormError}
      isApproving={isApproving}
      isRejecting={isRejecting}
      errorMessage={errorMessage}
      successState={successState}
      onApprove={handleApprove}
      onToggleReject={handleToggleReject}
      onRejectReasonChange={handleRejectReasonChange}
      onRejectSubmit={handleRejectSubmit}
    />
  )
}
