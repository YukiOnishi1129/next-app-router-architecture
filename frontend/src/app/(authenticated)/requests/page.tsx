import { RequestsPageTemplate } from '@/features/requests/components/server/RequestsPageTemplate'

import { RequestStatus } from '@/external/domain/request/request-status'

import type { RequestFilterInput } from '@/features/requests/types'

export default async function RequestsPage(props: PageProps<'/requests'>) {
  const { status } = await props.searchParams
  const normalizedStatus = Array.isArray(status) ? status[0] : status

  const filters: RequestFilterInput = {}
  const statusFilter = normalizeStatus(normalizedStatus)
  if (statusFilter) {
    filters.status = statusFilter
  }

  return <RequestsPageTemplate filters={filters} />
}

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
