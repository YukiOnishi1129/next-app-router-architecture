'use client'

import { PendingApprovalsListPresenter } from './PendingApprovalsListPresenter'
import { usePendingApprovals } from './usePendingApprovals'

export function PendingApprovalsListContainer() {
  const {
    approvals,
    isLoading,
    isRefetching,
    errorMessage,
    onApprove,
    onReject,
    approvingRequestId,
    rejectingRequestId,
    approveError,
    rejectError,
    successMessage,
    lastAction,
  } = usePendingApprovals()

  return (
    <PendingApprovalsListPresenter
      approvals={approvals}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
      onApprove={onApprove}
      onReject={onReject}
      approvingRequestId={approvingRequestId}
      rejectingRequestId={rejectingRequestId}
      approveError={approveError}
      rejectError={rejectError}
      successMessage={successMessage}
      lastAction={lastAction}
    />
  )
}
