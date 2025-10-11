import { RequestsPageTemplate } from '@/features/requests/components/server/RequestsPageTemplate'
import { RequestStatus } from '@/features/requests/types'

import type {
  RequestFilterInput,
  RequestsStatusTabKey,
} from '@/features/requests/types'

const REQUEST_STATUSES = Object.values(RequestStatus)

const normalizeStatus = (
  rawStatus: string | undefined
): RequestStatus | undefined => {
  if (!rawStatus) {
    return undefined
  }

  const upperCased = rawStatus.toUpperCase()
  return REQUEST_STATUSES.find((candidate) => candidate === upperCased)
}

export default async function RequestsPage(props: PageProps<'/requests'>) {
  const { status } = await props.searchParams
  const rawStatus = Array.isArray(status) ? status[0] : status

  const filters: RequestFilterInput = {}
  let activeTabKey: RequestsStatusTabKey = RequestStatus.DRAFT

  const upperStatus = rawStatus?.toUpperCase()

  if (!upperStatus) {
    filters.status = RequestStatus.DRAFT
    activeTabKey = RequestStatus.DRAFT
  } else if (upperStatus === 'ALL') {
    activeTabKey = 'ALL'
  } else {
    const statusFilter = normalizeStatus(upperStatus)
    if (statusFilter) {
      filters.status = statusFilter
      activeTabKey = statusFilter
    } else {
      filters.status = RequestStatus.DRAFT
      activeTabKey = RequestStatus.DRAFT
    }
  }

  return <RequestsPageTemplate filters={filters} activeTabKey={activeTabKey} />
}
