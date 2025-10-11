'use client'

import { useQuery } from '@tanstack/react-query'

import { listPendingApprovalsAction } from '@/features/approvals/actions'
import { approvalKeys } from '@/features/approvals/queries/keys'

export const usePendingApprovalsQuery = () =>
  useQuery({
    queryKey: approvalKeys.pending(),
    queryFn: async () => {
      const response = await listPendingApprovalsAction()
      if (!response.success || !response.requests) {
        throw new Error(response.error ?? 'Failed to load pending approvals')
      }
      return response.requests
    },
  })
