'use client'

import { RequestDetailPresenter } from './RequestDetailPresenter'
import { useRequestDetail } from './useRequestDetail'

type RequestDetailContainerProps = {
  requestId: string
  highlightCommentId?: string | null
}

export function RequestDetailContainer({
  requestId,
  highlightCommentId,
}: RequestDetailContainerProps) {
  const {
    detail,
    isLoading,
    isRefetching,
    errorMessage,
    highlightCommentId: highlight,
    canSubmit,
    onSubmit,
    isSubmitting,
    submitError,
    canApprove,
    canReject,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
    approveError,
    rejectError,
    approveSuccessMessage,
    rejectSuccessMessage,
  } = useRequestDetail({ requestId, highlightCommentId })

  return (
    <RequestDetailPresenter
      request={detail}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
      highlightCommentId={highlight}
      canSubmit={canSubmit}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      canApprove={canApprove}
      canReject={canReject}
      onApprove={onApprove}
      onReject={onReject}
      isApproving={isApproving}
      isRejecting={isRejecting}
      approveError={approveError}
      rejectError={rejectError}
      approveSuccessMessage={approveSuccessMessage}
      rejectSuccessMessage={rejectSuccessMessage}
    />
  )
}
