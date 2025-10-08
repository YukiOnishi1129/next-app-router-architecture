import { RequestDetailPageTemplate } from '@/features/requests/components/server/RequestDetailPageTemplate'

export default async function RequestDetailPage(
  props: PageProps<'/requests/[requestId]'>
) {
  const { requestId } = await props.params
  const { highlight } = await props.searchParams
  const highlightCommentId = Array.isArray(highlight) ? highlight[0] : highlight

  return (
    <RequestDetailPageTemplate
      requestId={requestId}
      highlightCommentId={highlightCommentId}
    />
  )
}
