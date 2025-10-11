'use client'

import { useQuery } from '@tanstack/react-query'

import { requestKeys } from '@/features/requests/queries/keys'
import {
  ensureRequestListResponse,
  selectRequestListFetcher,
} from '@/features/requests/queries/requestList.helpers'

import {
  listAllRequestsAction,
  listAssignedRequestsAction,
  listMyRequestsAction,
} from '@/external/handler/request/query.action'

import type { RequestFilterInput } from '@/features/requests/types'

export const useRequestListQuery = (filters: RequestFilterInput = {}) => {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: async () => {
      const fetcher = selectRequestListFetcher(filters, {
        listMine: listMyRequestsAction,
        listAssigned: listAssignedRequestsAction,
        listAll: listAllRequestsAction,
      })

      const response = await fetcher()
      return ensureRequestListResponse(response)
    },
  })
}
