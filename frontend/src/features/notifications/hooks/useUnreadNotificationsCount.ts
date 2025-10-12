'use client'

import { useMemo } from 'react'

import { useNotificationsQuery } from './query/useNotificationsQuery'

export const useUnreadNotificationsCount = () => {
  const { data, isLoading, error } = useNotificationsQuery(true)

  const count = useMemo(() => data?.notifications?.length ?? 0, [data])

  return {
    count,
    isLoading,
    error,
  }
}
