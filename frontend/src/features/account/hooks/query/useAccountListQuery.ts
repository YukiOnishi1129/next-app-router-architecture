'use client'

import { useQuery } from '@tanstack/react-query'

import { accountKeys } from '@/features/account/queries/keys'
import { listAccountsAction } from '@/external/handler/account/query.action'

import type {
  ListAccountsInput,
  ListAccountsResponse,
} from '@/external/handler/account/query.action'

type UseAccountListQueryOptions = {
  enabled?: boolean
  input?: ListAccountsInput
}

export function useAccountListQuery(
  { enabled = true, input }: UseAccountListQueryOptions = {}
) {
  return useQuery({
    queryKey: accountKeys.list(input ?? {}),
    queryFn: async (): Promise<ListAccountsResponse> => {
      const result = await listAccountsAction(input)
      if (!result.success || !result.accounts) {
        throw new Error(result.error ?? 'Failed to load accounts')
      }
      return result
    },
    enabled,
  })
}
