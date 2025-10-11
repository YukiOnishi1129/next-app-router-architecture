import Link from 'next/link'

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
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Requests</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage your pending and completed approval requests.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/80 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition focus-visible:ring-2 focus-visible:outline-none"
        >
          Create request
        </Link>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestList filters={filters} />
      </HydrationBoundary>
    </section>
  )
}
