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
    canReopen,
    onApprove,
    onReject,
    onReopen,
    isApproving,
    isRejecting,
    isReopening,
    approveError,
    rejectError,
    reopenError,
    approveSuccessMessage,
    rejectSuccessMessage,
    reopenSuccessMessage,
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
      canReopen={canReopen}
      onApprove={onApprove}
      onReject={onReject}
      onReopen={onReopen}
      isApproving={isApproving}
      isRejecting={isRejecting}
      isReopening={isReopening}
      approveError={approveError}
      rejectError={rejectError}
      reopenError={reopenError}
      approveSuccessMessage={approveSuccessMessage}
      rejectSuccessMessage={rejectSuccessMessage}
      reopenSuccessMessage={reopenSuccessMessage}
    />
  )
}
