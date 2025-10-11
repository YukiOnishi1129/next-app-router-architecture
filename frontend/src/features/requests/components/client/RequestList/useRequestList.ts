'use client'

import { useMemo } from 'react'

import { useRequestListQuery } from '@/features/requests/hooks/query/useRequestListQuery'
import { mapRequestDtoToSummary } from '@/features/requests/queries/requestList.helpers'

import type {
  RequestSummary,
  RequestFilterInput,
} from '@/features/requests/types'

type UseRequestListParam = {
  filters: RequestFilterInput
}

export const useRequestList = ({ filters }: UseRequestListParam) => {
  const memoizedFilters = useMemo(() => filters ?? {}, [filters])
  const { data, isPending, isFetching, error } =
    useRequestListQuery(memoizedFilters)

  const summaries = useMemo<RequestSummary[]>(() => {
    if (!data) {
      return []
    }
    return data.requests.map(mapRequestDtoToSummary)
  }, [data])

  return {
    data,
    summaries,
    isLoading: isPending && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
  }
}
