import Link from 'next/link'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { PendingApprovalsList } from '@/features/approvals/components/client/PendingApprovalsList'
import { approvalKeys } from '@/features/approvals/queries/keys'

import { getQueryClient } from '@/shared/lib/query-client'

import { listPendingApprovalsServer } from '@/external/handler/request/query.server'

export async function PendingApprovalsPageTemplate() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: approvalKeys.pending(),
    queryFn: async () => {
      const response = await listPendingApprovalsServer()
      if (!response.success || !response.requests) {
        throw new Error(response.error ?? 'Failed to load pending approvals')
      }
      return response.requests
    },
  })

  return (
    <section className="space-y-6 px-6 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Pending approvals</h1>
          <p className="text-muted-foreground text-sm">
            Review and take action on requests awaiting your decision.
          </p>
        </div>
        <Link
          href="/approvals/history?status=APPROVED"
          className="bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition focus-visible:ring-2 focus-visible:outline-none"
        >
          View approval history
        </Link>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PendingApprovalsList />
      </HydrationBoundary>
    </section>
  )
}
