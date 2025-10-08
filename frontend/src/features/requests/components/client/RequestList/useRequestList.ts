'use client'

import { useMemo } from 'react'

import type {
  RequestFilterInput,
  RequestSummary,
} from '@/features/requests/types'

type UseRequestListProps = {
  filters: RequestFilterInput
}

export const useRequestList = ({ filters }: UseRequestListProps) => {
  // Placeholder data until server actions are connected.
  const data = useMemo<RequestSummary[]>(() => {
    const base = [
      {
        id: 'req-001',
        title: 'Laptop purchase approval',
        status: 'approved' as const,
        submittedAt: new Date().toISOString(),
        amount: 2400,
      },
      {
        id: 'req-002',
        title: 'Conference travel expenses',
        status: 'submitted' as const,
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        amount: 850,
      },
      {
        id: 'req-003',
        title: 'CRM access request',
        status: 'draft' as const,
        submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ]

    if (filters.status) {
      return base.filter((request) => request.status === filters.status)
    }

    return base
  }, [filters])

  return {
    data,
    isLoading: false,
  }
}
