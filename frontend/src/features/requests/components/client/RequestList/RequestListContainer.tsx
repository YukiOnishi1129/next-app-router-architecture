'use client'

import { RequestListPresenter } from './RequestListPresenter'
import { useRequestList } from './useRequestList'

import type { RequestFilterInput } from '@/features/requests/types'

type RequestListContainerProps = {
  filters: RequestFilterInput
}

export function RequestListContainer({ filters }: RequestListContainerProps) {
  const { summaries, isLoading, isRefetching, errorMessage } = useRequestList({
    filters,
  })

  return (
    <RequestListPresenter
      requests={summaries}
      isLoading={isLoading}
      isRefetching={isRefetching}
      errorMessage={errorMessage}
    />
  )
}
