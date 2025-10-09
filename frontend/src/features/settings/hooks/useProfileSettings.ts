'use client'

import { useCallback } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { updateUserProfileAction } from '@/external/handler/user/command.action'
import { getCurrentUserAction } from '@/external/handler/user/query.action'

import { settingsKeys } from '../queries/keys'

import type {
  GetUserResponse,
  UpdateUserProfileInput,
} from '@/external/dto/user'

type Profile = NonNullable<GetUserResponse['user']>

async function fetchProfile(): Promise<Profile> {
  const result = await getCurrentUserAction()
  if (!result.success || !result.user) {
    throw new Error(result.error ?? 'Failed to load profile')
  }
  return result.user
}

async function updateProfile(input: UpdateUserProfileInput): Promise<Profile> {
  const result = await updateUserProfileAction(input)
  if (!result.success || !result.user) {
    throw new Error(result.error ?? 'Failed to update profile')
  }
  return result.user
}

export const useProfileSettings = () => {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(settingsKeys.profile(), user)
    },
  })

  const mutateAsync = useCallback(
    (input: UpdateUserProfileInput) => updateMutation.mutateAsync(input),
    [updateMutation]
  )

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error as Error | null,
    refetch: profileQuery.refetch,
    updateProfile: mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error as Error | null,
    resetUpdateState: updateMutation.reset,
  }
}
