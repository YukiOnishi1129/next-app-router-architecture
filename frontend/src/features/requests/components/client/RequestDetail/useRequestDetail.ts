'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useReopenRequestMutation } from '@/features/requests/hooks/mutation/useReopenRequestMutation'
import { useSubmitRequestMutation } from '@/features/requests/hooks/mutation/useSubmitRequestMutation'
import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import { mapRequestDtoToDetail } from '@/features/requests/queries/requestList.helpers'
import { RequestStatus } from '@/features/requests/types'

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
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()
  const reopenMutation = useReopenRequestMutation()
  const [approveSuccessMessage, setApproveSuccessMessage] = useState<
    string | null
  >(null)
  const [rejectSuccessMessage, setRejectSuccessMessage] = useState<
    string | null
  >(null)
  const [reopenSuccessMessage, setReopenSuccessMessage] = useState<
    string | null
  >(null)
  const [isResubmitting, setIsResubmitting] = useState(false)

  const detail = useMemo<RequestDetail | null>(
    () => (data ? mapRequestDtoToDetail(data) : null),
    [data]
  )

  const currentAccountId = session?.account?.id ?? null
  const accountRoles = Array.isArray(session?.account?.roles)
    ? (session?.account?.roles ?? [])
    : []
  const isAdmin = accountRoles.includes('ADMIN')
  const isRequester =
    detail && currentAccountId ? detail.requesterId === currentAccountId : false
  const isReviewableStatus = detail
    ? [RequestStatus.SUBMITTED, RequestStatus.IN_REVIEW].includes(detail.status)
    : false

  const canSubmit = Boolean(
    detail &&
      detail.status === RequestStatus.DRAFT &&
      detail.requesterId === currentAccountId
  )
  const canReview = Boolean(
    detail && isAdmin && !isRequester && isReviewableStatus
  )
  const canReopen = Boolean(
    detail && isRequester && detail.status === RequestStatus.REJECTED
  )

  const handleSubmit = useCallback(() => {
    if (!canSubmit || submitMutation.isPending) {
      return
    }
    submitMutation.reset()
    submitMutation.mutate()
  }, [canSubmit, submitMutation])

  const handleApprove = useCallback(() => {
    if (!canReview || approveMutation.isPending) {
      return
    }
    approveMutation.reset()
    approveMutation.mutate({ requestId })
  }, [approveMutation, canReview, requestId])

  const handleReject = useCallback(
    (reason: string) => {
      if (!canReview || rejectMutation.isPending) {
        return
      }
      rejectMutation.reset()
      rejectMutation.mutate({ requestId, reason })
    },
    [canReview, rejectMutation, requestId]
  )

  const handleReopen = useCallback(() => {
    if (!canReopen || reopenMutation.isPending) {
      return
    }
    setApproveSuccessMessage(null)
    setRejectSuccessMessage(null)
    setReopenSuccessMessage(null)
    reopenMutation.reset()
    reopenMutation.mutate({ requestId })
  }, [canReopen, reopenMutation, requestId])

  const handleReopenAndSubmit = useCallback(async () => {
    if (
      !canReopen ||
      reopenMutation.isPending ||
      submitMutation.isPending ||
      isResubmitting
    ) {
      return
    }
    setIsResubmitting(true)
    setApproveSuccessMessage(null)
    setRejectSuccessMessage(null)
    setReopenSuccessMessage(null)
    try {
      reopenMutation.reset()
      await reopenMutation.mutateAsync({ requestId })
      submitMutation.reset()
      await submitMutation.mutateAsync()
      setReopenSuccessMessage('Request resubmitted successfully.')
    } catch {
      // Errors bubble via mutation error states
    } finally {
      setIsResubmitting(false)
    }
  }, [canReopen, isResubmitting, reopenMutation, requestId, submitMutation])

  useEffect(() => {
    if (approveMutation.isSuccess) {
      setApproveSuccessMessage('Request approved successfully.')
    }
  }, [approveMutation.isSuccess])

  useEffect(() => {
    if (rejectMutation.isSuccess) {
      setRejectSuccessMessage('Request rejected successfully.')
    }
  }, [rejectMutation.isSuccess])

  useEffect(() => {
    if (!reopenMutation.isSuccess) {
      return
    }
    setReopenSuccessMessage(
      (current) =>
        current ??
        'Request reopened for editing. Make updates and submit again.'
    )
  }, [reopenMutation.isSuccess])

  useEffect(() => {
    if (!approveSuccessMessage) {
      return
    }
    const timer = window.setTimeout(() => setApproveSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [approveSuccessMessage])

  useEffect(() => {
    if (!rejectSuccessMessage) {
      return
    }
    const timer = window.setTimeout(() => setRejectSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [rejectSuccessMessage])

  useEffect(() => {
    if (!reopenSuccessMessage) {
      return
    }
    const timer = window.setTimeout(() => setReopenSuccessMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [reopenSuccessMessage])

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
    canApprove: canReview,
    canReject: canReview,
    canReopen,
    onApprove: handleApprove,
    onReject: handleReject,
    onReopen: handleReopen,
    onReopenAndSubmit: handleReopenAndSubmit,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isReopening: reopenMutation.isPending,
    isResubmitting,
    approveError:
      approveMutation.error instanceof Error
        ? approveMutation.error.message
        : undefined,
    rejectError:
      rejectMutation.error instanceof Error
        ? rejectMutation.error.message
        : undefined,
    reopenError:
      reopenMutation.error instanceof Error
        ? reopenMutation.error.message
        : undefined,
    approveSuccessMessage,
    rejectSuccessMessage,
    reopenSuccessMessage,
  }
}
