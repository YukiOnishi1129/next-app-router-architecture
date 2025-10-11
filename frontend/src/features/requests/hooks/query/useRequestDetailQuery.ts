'use client'

import { useQuery } from '@tanstack/react-query'

import { requestKeys } from '@/features/requests/queries/keys'
import { ensureRequestDetailResponse } from '@/features/requests/queries/requestList.helpers'

import { getRequestDetailAction } from '@/external/handler/request/query.action'

export const useRequestDetailQuery = (requestId: string) => {
  return useQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: async () => {
      const response = await getRequestDetailAction({ requestId })
      return ensureRequestDetailResponse(response)
    },
    enabled: Boolean(requestId),
  })
}
