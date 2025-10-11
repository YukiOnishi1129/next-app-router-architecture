'use client'

import { useMemo } from 'react'

import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import { mapRequestDtoToDetail } from '@/features/requests/queries/requestList.helpers'

import type { RequestDetail } from '@/features/requests/types'

type UseRequestDetailParams = {
  requestId: string
  highlightCommentId?: string | null
}

export const useRequestDetail = ({
  requestId,
  highlightCommentId,
}: UseRequestDetailParams) => {
  const { data, isPending, isFetching, error } =
    useRequestDetailQuery(requestId)

  const detail = useMemo<RequestDetail | null>(
    () => (data ? mapRequestDtoToDetail(data) : null),
    [data]
  )

  return {
    detail,
    highlightCommentId: highlightCommentId ?? null,
    isLoading: isPending && !detail,
    isRefetching: isFetching && !!detail,
    errorMessage: error instanceof Error ? error.message : undefined,
  }
}
