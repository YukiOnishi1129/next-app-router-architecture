import { redirect } from 'next/navigation'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { getSessionServer } from '@/features/auth/servers/session.server'
import { RequestEditForm } from '@/features/requests/components/client/RequestForm/RequestEditForm'
import { requestKeys } from '@/features/requests/queries/keys'
import { ensureRequestDetailResponse } from '@/features/requests/queries/requestList.helpers'

import { getQueryClient } from '@/shared/lib/query-client'

import { RequestStatus } from '@/external/domain/request/request-status'
import { getRequestDetailServer } from '@/external/handler/request/query.server'

type RequestEditPageTemplateProps = {
  requestId: string
}

export async function RequestEditPageTemplate({
  requestId,
}: RequestEditPageTemplateProps) {
  const queryClient = getQueryClient()

  const request = await queryClient.fetchQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: async () => {
      const response = await getRequestDetailServer({ requestId })
      return ensureRequestDetailResponse(response)
    },
  })

  const session = await getSessionServer()

  if (!session?.account) {
    redirect('/login')
  }

  const isRequester = request.requesterId === session.account.id
  const isDraft = request.status === RequestStatus.DRAFT

  if (!isRequester || !isDraft) {
    redirect(`/requests/${requestId}`)
  }

  return (
    <section className="px-6 py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Edit request</h1>
        <p className="text-muted-foreground text-sm">
          Update the request details and save your changes before submitting.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestEditForm requestId={requestId} />
      </HydrationBoundary>
    </section>
  )
}
