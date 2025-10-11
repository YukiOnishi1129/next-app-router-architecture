'use client'

import { useMemo } from 'react'

import { RequestStatus } from '@/features/requests/types'

import type {
  RequestsStatusRoute,
  RequestsStatusTabKey,
} from '@/features/requests/types'

type UseRequestsStatusTabListParams = {
  activeKey: RequestsStatusTabKey
}

export type RequestsStatusTab = {
  key: RequestsStatusTabKey
  status?: RequestStatus
  label: string
  href: RequestsStatusRoute
  isActive: boolean
}

export const useRequestsStatusTabList = ({
  activeKey,
}: UseRequestsStatusTabListParams) => {
  const resolvedKey = activeKey ?? RequestStatus.DRAFT

  const tabs = useMemo<RequestsStatusTab[]>(() => {
    const definitions: Array<{
      key: RequestsStatusTabKey
      status?: RequestStatus
      label: string
      href: RequestsStatusRoute
    }> = [
      {
        key: 'ALL',
        status: undefined,
        label: 'All',
        href: '/requests?status=ALL' as RequestsStatusRoute,
      },
      {
        key: RequestStatus.DRAFT,
        status: RequestStatus.DRAFT,
        label: 'Draft',
        href: '/requests?status=DRAFT' as RequestsStatusRoute,
      },
      {
        key: RequestStatus.SUBMITTED,
        status: RequestStatus.SUBMITTED,
        label: 'Submitted',
        href: '/requests?status=SUBMITTED' as RequestsStatusRoute,
      },
      {
        key: RequestStatus.APPROVED,
        status: RequestStatus.APPROVED,
        label: 'Approved',
        href: '/requests?status=APPROVED' as RequestsStatusRoute,
      },
      {
        key: RequestStatus.REJECTED,
        status: RequestStatus.REJECTED,
        label: 'Rejected',
        href: '/requests?status=REJECTED' as RequestsStatusRoute,
      },
    ]

    return definitions.map(({ key, status, label, href }) => ({
      key,
      status,
      label,
      href,
      isActive: key === resolvedKey,
    }))
  }, [resolvedKey])

  return { tabs }
}
