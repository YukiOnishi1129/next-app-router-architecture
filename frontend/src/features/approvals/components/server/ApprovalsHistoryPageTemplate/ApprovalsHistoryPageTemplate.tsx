import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { ApprovalsHistory } from '@/features/approvals/components/client/ApprovalsHistory'
import { approvalKeys } from '@/features/approvals/queries/keys'

import { getQueryClient } from '@/shared/lib/query-client'

import {
  getReviewerSummaryServer,
  listReviewedRequestsServer,
} from '@/external/handler/request/query.server'

import type { ReviewerStatus } from '@/features/approvals/types'

type ApprovalsHistoryPageTemplateProps = {
  status: ReviewerStatus
}

export async function ApprovalsHistoryPageTemplate({
  status,
}: ApprovalsHistoryPageTemplateProps) {
  const queryClient = getQueryClient()

  const summaryResponse = await getReviewerSummaryServer()
  if (!summaryResponse.success || !summaryResponse.summary) {
    throw new Error(summaryResponse.error ?? 'Failed to load reviewer summary')
  }

  await queryClient.prefetchQuery({
    queryKey: approvalKeys.history(status),
    queryFn: async () => {
      const response = await listReviewedRequestsServer({ status })
      if (!response.success || !response.requests) {
        throw new Error(
          response.error ?? 'Failed to load review history requests'
        )
      }
      return response.requests
    },
  })

  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Approval history</h1>
        <p className="text-muted-foreground text-sm">
          See the requests you&apos;ve already approved or rejected.
        </p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ApprovalsHistory status={status} summary={summaryResponse.summary} />
      </HydrationBoundary>
    </section>
  )
}
