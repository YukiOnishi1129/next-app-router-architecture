'use client'

import { useQuery } from '@tanstack/react-query'

import { listReviewedApprovalsAction } from '@/external/handler/request/query.action'
import { approvalKeys } from '@/features/approvals/queries/keys'

import type { ReviewerStatus } from '@/features/approvals/types'

export const useReviewedApprovalsQuery = (status: ReviewerStatus) =>
  useQuery({
    queryKey: approvalKeys.history(status),
    queryFn: async () => {
      const response = await listReviewedApprovalsAction({ status })
      if (!response.success || !response.requests) {
        throw new Error(response.error ?? 'Failed to load review history')
      }
      return response.requests
    },
  })
