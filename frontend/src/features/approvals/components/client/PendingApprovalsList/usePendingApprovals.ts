'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import { usePendingApprovalsQuery } from '@/features/approvals/hooks/query/usePendingApprovalsQuery'
import { mapPendingApprovalDto } from '@/features/approvals/queries/pending-approvals.helpers'

import type { PendingApproval } from '@/features/approvals/types'

type ActionError = {
  requestId: string
  message: string
} | null

type LastAction =
  | {
      type: 'approve'
      requestId: string
    }
  | {
      type: 'reject'
      requestId: string
    }
  | null

export const usePendingApprovals = () => {
  const { data, isLoading, isFetching, error } = usePendingApprovalsQuery()
  const approveMutation = useApproveRequestMutation()
  const rejectMutation = useRejectRequestMutation()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<LastAction>(null)

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
    (requestId: string, reason: string) => {
      if (rejectMutation.isPending) {
        return
      }
      rejectMutation.reset()
      rejectMutation.mutate({ requestId, reason })
    },
    [rejectMutation]
  )

  useEffect(() => {
    if (approveMutation.isSuccess && approveMutation.variables) {
      setLastAction({
        type: 'approve',
        requestId: approveMutation.variables.requestId,
      })
      setSuccessMessage('Request approved successfully.')
    }
  }, [approveMutation.isSuccess, approveMutation.variables])

  useEffect(() => {
    if (rejectMutation.isSuccess && rejectMutation.variables) {
      setLastAction({
        type: 'reject',
        requestId: rejectMutation.variables.requestId,
      })
      setSuccessMessage('Request rejected successfully.')
    }
  }, [rejectMutation.isSuccess, rejectMutation.variables])

  useEffect(() => {
    if (!successMessage) {
      return
    }
    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    if (!lastAction) {
      return
    }
    const timer = window.setTimeout(() => {
      setLastAction(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [lastAction])

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
    successMessage,
    lastAction,
  }
}
