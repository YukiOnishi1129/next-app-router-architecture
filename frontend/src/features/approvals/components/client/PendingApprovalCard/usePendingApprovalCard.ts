'use client'

import { useCallback, useRef, useState } from 'react'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'

import type { PendingApproval } from '@/features/approvals/types'

type UsePendingApprovalCardParams = {
  approval: PendingApproval
  onActionComplete: (type: 'approve' | 'reject') => void
}

type UsePendingApprovalCardResult = {
  showRejectForm: boolean
  rejectReason: string
  rejectFormError?: string | null
  isApproving: boolean
  isRejecting: boolean
  errorMessage?: string | null
  successState: 'approve' | 'reject' | null
  handleApprove: () => void
  handleToggleReject: () => void
  handleRejectReasonChange: (value: string) => void
  handleRejectSubmit: () => void
}

export const usePendingApprovalCard = ({
  approval,
  onActionComplete,
}: UsePendingApprovalCardParams): UsePendingApprovalCardResult => {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectFormError, setRejectFormError] = useState<string | null>(null)
  const [successState, setSuccessState] = useState<'approve' | 'reject' | null>(
    null
  )
  const successTimerRef = useRef<number | null>(null)

  const clearLocalSuccess = useCallback(() => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }, [])

  const scheduleLocalSuccess = useCallback(
    (type: 'approve' | 'reject') => {
      clearLocalSuccess()
      setSuccessState(type)
      successTimerRef.current = window.setTimeout(() => {
        setSuccessState(null)
        successTimerRef.current = null
      }, 4000)
    },
    [clearLocalSuccess]
  )

  const approveMutation = useApproveRequestMutation({
    onSuccess: (_data, _variables, _context) => {
      scheduleLocalSuccess('approve')
      setShowRejectForm(false)
      setRejectReason('')
      setRejectFormError(null)
      onActionComplete('approve')
    },
  })

  const rejectMutation = useRejectRequestMutation({
    onSuccess: (_data, _variables, _context) => {
      scheduleLocalSuccess('reject')
      setShowRejectForm(false)
      setRejectReason('')
      setRejectFormError(null)
      onActionComplete('reject')
    },
  })

  const handleApprove = useCallback(() => {
    if (approveMutation.isPending) {
      return
    }
    approveMutation.reset()
    approveMutation.mutate({ requestId: approval.id })
  }, [approveMutation, approval.id])

  const handleToggleReject = useCallback(() => {
    setShowRejectForm((prev) => {
      if (prev) {
        setRejectReason('')
        setRejectFormError(null)
      }
      return !prev
    })
  }, [])

  const handleRejectReasonChange = useCallback(
    (value: string) => {
      setRejectReason(value)
      if (rejectFormError) {
        setRejectFormError(null)
      }
    },
    [rejectFormError]
  )

  const handleRejectSubmit = useCallback(() => {
    if (rejectMutation.isPending) {
      return
    }
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setRejectFormError('Please provide a rejection reason.')
      return
    }
    rejectMutation.reset()
    rejectMutation.mutate({ requestId: approval.id, reason: trimmed })
  }, [rejectMutation, rejectReason, approval.id])

  const errorMessage = approveMutation.error
    ? approveMutation.error.message
    : rejectMutation.error
      ? rejectMutation.error.message
      : undefined

  return {
    showRejectForm,
    rejectReason,
    rejectFormError,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    errorMessage,
    successState,
    handleApprove,
    handleToggleReject,
    handleRejectReasonChange,
    handleRejectSubmit,
  }
}
