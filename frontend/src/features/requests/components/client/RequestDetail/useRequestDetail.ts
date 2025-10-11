'use client'

import { useCallback, useMemo } from 'react'

import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useSubmitRequestMutation } from '@/features/requests/hooks/mutation/useSubmitRequestMutation'
import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import { mapRequestDtoToDetail } from '@/features/requests/queries/requestList.helpers'

import { RequestStatus } from '@/external/domain/request/request-status'

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
  const { session } = useAuthSession()
  const submitMutation = useSubmitRequestMutation(requestId)

  const detail = useMemo<RequestDetail | null>(
    () => (data ? mapRequestDtoToDetail(data) : null),
    [data]
  )

  const currentAccountId = session?.account?.id ?? null
  const canSubmit = Boolean(
    detail &&
      detail.status === RequestStatus.DRAFT &&
      detail.requesterId === currentAccountId
  )

  const handleSubmit = useCallback(() => {
    if (!canSubmit || submitMutation.isPending) {
      return
    }
    submitMutation.reset()
    submitMutation.mutate()
  }, [canSubmit, submitMutation])

  return {
    detail,
    highlightCommentId: highlightCommentId ?? null,
    isLoading: isPending && !detail,
    isRefetching: isFetching && !!detail,
    errorMessage: error instanceof Error ? error.message : undefined,
    canSubmit,
    onSubmit: handleSubmit,
    isSubmitting: submitMutation.isPending,
    submitError:
      submitMutation.error instanceof Error
        ? submitMutation.error.message
        : undefined,
  }
}
