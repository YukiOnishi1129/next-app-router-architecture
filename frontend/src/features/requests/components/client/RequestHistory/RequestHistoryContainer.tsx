'use client'

import { RequestHistoryPresenter } from './RequestHistoryPresenter'
import { useRequestHistory } from './useRequestHistory'

type RequestHistoryContainerProps = {
  requestId: string
}

export function RequestHistoryContainer({
  requestId,
}: RequestHistoryContainerProps) {
  const { auditLogs, notifications, isLoading, isRefetching, errorMessage } =
    useRequestHistory(requestId)

  return (
    <RequestHistoryPresenter
      auditLogs={auditLogs}
      notifications={notifications}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
    />
  )
}
