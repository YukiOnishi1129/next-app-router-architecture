import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { RequestDetail } from '@/features/requests/components/client/RequestDetail'
import { requestKeys } from '@/features/requests/queries/keys'
import { ensureRequestDetailResponse } from '@/features/requests/queries/requestList.helpers'

import { getQueryClient } from '@/shared/lib/query-client'

import { getRequestDetailServer } from '@/external/handler/request/query.server'

type RequestDetailPageTemplateProps = {
  requestId: string
  highlightCommentId?: string | null
}

export async function RequestDetailPageTemplate({
  requestId,
  highlightCommentId,
}: RequestDetailPageTemplateProps) {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: async () => {
      const response = await getRequestDetailServer({ requestId })
      return ensureRequestDetailResponse(response)
    },
  })

  return (
    <section className="px-6 py-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestDetail
          requestId={requestId}
          highlightCommentId={highlightCommentId}
        />
      </HydrationBoundary>
    </section>
  )
}
