'use client'

import { useMemo } from 'react'

import { useRequestHistoryQuery } from '@/features/requests/hooks/query/useRequestHistoryQuery'
import {
  mapAuditLogDtoToEntry,
  mapNotificationDtoToEntry,
} from '@/features/requests/queries/requestHistory.helpers'

import type {
  RequestAuditLogEntry,
  RequestNotificationEntry,
} from '@/features/requests/types'

export const useRequestHistory = (requestId: string) => {
  const { data, isLoading, isFetching, error } =
    useRequestHistoryQuery(requestId)

  const auditLogs = useMemo<RequestAuditLogEntry[]>(() => {
    if (!data?.auditLogs) {
      return []
    }
    return data.auditLogs.map(mapAuditLogDtoToEntry)
  }, [data])

  const notifications = useMemo<RequestNotificationEntry[]>(() => {
    if (!data?.notifications) {
      return []
    }
    return data.notifications.map(mapNotificationDtoToEntry)
  }, [data])

  return {
    auditLogs,
    notifications,
    isLoading: isLoading && !data,
    isRefetching: isFetching && !!data,
    errorMessage: error instanceof Error ? error.message : undefined,
  }
}
