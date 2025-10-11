'use client'

import { useCallback, useMemo } from 'react'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import { usePendingApprovalsQuery } from '@/features/approvals/hooks/query/usePendingApprovalsQuery'
import { mapPendingApprovalDto } from '@/features/approvals/queries/pending-approvals.helpers'

import type { PendingApproval } from '@/features/approvals/types'

type ActionError = {
  requestId: string
  message: string
} | null

export const usePendingApprovals = () => {
  const { data, isLoading, isFetching, error } = usePendingApprovalsQuery()
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()

  const approvals = useMemo<PendingApproval[]>(() => {
    if (!data) {
      return []
    }
    return data.map(mapPendingApprovalDto)
  }, [data])

  const handleApprove = useCallback(
    (requestId: string) => {
      if (approveMutation.isPending) {
        return
      }
      approveMutation.reset()
      approveMutation.mutate({ requestId })
    },
    [approveMutation]
  )

  const handleReject = useCallback(
    (requestId: string) => {
      if (rejectMutation.isPending) {
        return
      }
      const reason = window.prompt(
        'Please provide a reason for rejecting this request.'
      )
      if (!reason || !reason.trim()) {
        return
      }
      rejectMutation.reset()
      rejectMutation.mutate({ requestId, reason: reason.trim() })
    },
    [rejectMutation]
  )

  const approvingRequestId = approveMutation.isPending
    ? (approveMutation.variables?.requestId ?? null)
    : null
  const rejectingRequestId = rejectMutation.isPending
    ? (rejectMutation.variables?.requestId ?? null)
    : null

  const approveError: ActionError =
    approveMutation.error instanceof Error && approveMutation.variables
      ? {
          requestId: approveMutation.variables.requestId,
          message: approveMutation.error.message,
        }
      : null

  const rejectError: ActionError =
    rejectMutation.error instanceof Error && rejectMutation.variables
      ? {
          requestId: rejectMutation.variables.requestId,
          message: rejectMutation.error.message,
        }
      : null

  return {
    approvals,
    isLoading: isLoading && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
    onApprove: handleApprove,
    onReject: handleReject,
    approvingRequestId,
    rejectingRequestId,
    approveError,
    rejectError,
  }
}
