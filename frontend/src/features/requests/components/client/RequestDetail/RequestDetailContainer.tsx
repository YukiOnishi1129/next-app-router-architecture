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
    onReopen,
    onReopenAndSubmit,
    isApproving,
    isRejecting,
    isReopening,
    isResubmitting,
    approveError,
    rejectError,
    reopenError,
    approveSuccessMessage,
    rejectSuccessMessage,
    reopenSuccessMessage,
    showRejectForm,
    rejectReason,
    rejectFormError,
    onRejectToggle,
    onRejectReasonChange,
    onRejectSubmit,
    onEdit,
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
      onReopen={onReopen}
      onReopenAndSubmit={onReopenAndSubmit}
      isApproving={isApproving}
      isRejecting={isRejecting}
      isReopening={isReopening}
      isResubmitting={isResubmitting}
      approveError={approveError}
      rejectError={rejectError}
      reopenError={reopenError}
      approveSuccessMessage={approveSuccessMessage}
      rejectSuccessMessage={rejectSuccessMessage}
      reopenSuccessMessage={reopenSuccessMessage}
      showRejectForm={showRejectForm}
      rejectReason={rejectReason}
      rejectFormError={rejectFormError}
      onRejectToggle={onRejectToggle}
      onRejectReasonChange={onRejectReasonChange}
      onRejectSubmit={onRejectSubmit}
      onEdit={onEdit}
    />
  )
}
