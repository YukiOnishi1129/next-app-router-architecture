'use client'

import { RequestsStatusTabListPresenter } from './RequestsStatusTabListPresenter'
import { useRequestsStatusTabList } from './useRequestsStatusTabList'

import type { RequestsStatusTabKey } from '@/features/requests/types'

type RequestsStatusTabListContainerProps = {
  activeKey: RequestsStatusTabKey
}

export function RequestsStatusTabListContainer({
  activeKey,
}: RequestsStatusTabListContainerProps) {
  const { tabs } = useRequestsStatusTabList({ activeKey })

  return <RequestsStatusTabListPresenter tabs={tabs} />
}
