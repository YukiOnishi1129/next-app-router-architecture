import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { RequestList } from '@/features/requests/components/client/RequestList'
import { requestKeys } from '@/features/requests/queries/keys'
import {
  ensureRequestListResponse,
  selectRequestListFetcher,
} from '@/features/requests/queries/requestList.helpers'

import { getQueryClient } from '@/shared/lib/query-client'

import {
  listAllRequestsServer,
  listAssignedRequestsServer,
  listMyRequestsServer,
} from '@/external/handler/request/query.server'

import type { RequestFilterInput } from '@/features/requests/types'

type RequestsPageTemplateProps = {
  filters?: RequestFilterInput
}

export async function RequestsPageTemplate({
  filters = {},
}: RequestsPageTemplateProps) {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: requestKeys.list(filters),
    queryFn: async () => {
      const fetcher = selectRequestListFetcher(filters, {
        listMine: listMyRequestsServer,
        listAssigned: listAssignedRequestsServer,
        listAll: listAllRequestsServer,
      })

      const response = await fetcher()
      return ensureRequestListResponse(response)
    },
  })

  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="text-muted-foreground text-sm">
          Track and manage your pending and completed approval requests.
        </p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestList filters={filters} />
      </HydrationBoundary>
    </section>
  )
}
