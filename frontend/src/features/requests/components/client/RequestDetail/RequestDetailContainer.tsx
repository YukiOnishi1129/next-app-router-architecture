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
  } = useRequestDetail({ requestId, highlightCommentId })

  return (
    <RequestDetailPresenter
      request={detail}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
      highlightCommentId={highlight}
    />
  )
}
