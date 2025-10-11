'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { usePendingApprovalsQuery } from '@/features/approvals/hooks/query/usePendingApprovalsQuery'
import { mapPendingApprovalDto } from '@/features/approvals/queries/pending-approvals.helpers'

import type { PendingApproval } from '@/features/approvals/types'

type PendingApprovalsState = {
  approvals: PendingApproval[]
  isLoading: boolean
  isRefetching: boolean
  errorMessage?: string
  successMessage: string | null
  handleActionComplete: (type: 'approve' | 'reject') => void
}

export const usePendingApprovals = (): PendingApprovalsState => {
  const { data, isLoading, isFetching, error } = usePendingApprovalsQuery()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const handleActionComplete = useCallback((type: 'approve' | 'reject') => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setSuccessMessage(
      type === 'approve'
        ? 'Request approved successfully.'
        : 'Request rejected successfully.'
    )
    timeoutRef.current = window.setTimeout(() => {
      setSuccessMessage(null)
      timeoutRef.current = null
    }, 4000)
  }, [])

  const approvals = useMemo<PendingApproval[]>(() => {
    if (!data) {
      return []
    }
    return data.map(mapPendingApprovalDto)
  }, [data])

  return {
    approvals,
    isLoading: isLoading && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
    successMessage,
    handleActionComplete,
  }
}
