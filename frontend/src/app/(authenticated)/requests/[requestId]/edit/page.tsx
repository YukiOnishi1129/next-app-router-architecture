import { RequestEditPageTemplate } from '@/features/requests/components/server/RequestEditPageTemplate'

export default async function RequestEditPage(
  props: PageProps<'/requests/[requestId]/edit'>
) {
  const { requestId } = await props.params

  return <RequestEditPageTemplate requestId={requestId} />
}
