'use client'

import { useQuery } from '@tanstack/react-query'

import { getCurrentAccountAction } from '@/external/handler/account/query.action'

import { settingsKeys } from '../queries/keys'

import type { GetAccountResponse } from '@/external/dto/account'

type Profile = NonNullable<GetAccountResponse['account']>

async function fetchProfile(): Promise<Profile> {
  const result = await getCurrentAccountAction()
  if (!result.success || !result.account) {
    throw new Error(result.error ?? 'Failed to load profile')
  }
  return result.account
}

export const useProfileSettingsQuery = () => {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  })
}
