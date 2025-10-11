'use client'

import { useQuery } from '@tanstack/react-query'

import { getRequestHistoryAction } from '@/features/requests/actions'
import { requestKeys } from '@/features/requests/queries/keys'

export const useRequestHistoryQuery = (requestId: string) =>
  useQuery({
    queryKey: requestKeys.history(requestId),
    queryFn: async () => {
      const response = await getRequestHistoryAction({ requestId })
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load request history')
      }
      return response
    },
  })
