'use client'

import { useQuery } from '@tanstack/react-query'

import { getCurrentUserAction } from '@/external/handler/user/query.action'

import { settingsKeys } from '../queries/keys'

import type { GetUserResponse } from '@/external/dto/user'

type Profile = NonNullable<GetUserResponse['user']>

async function fetchProfile(): Promise<Profile> {
  const result = await getCurrentUserAction()
  if (!result.success || !result.user) {
    throw new Error(result.error ?? 'Failed to load profile')
  }
  return result.user
}

export const useProfileSettingsQuery = () => {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  })
}
