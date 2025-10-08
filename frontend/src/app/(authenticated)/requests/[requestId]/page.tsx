import { RequestDetailPageTemplate } from "@/features/requests/components/server/RequestDetailPageTemplate";

export default async function RequestDetailPage(
  props: PageProps<"/requests/[requestId]">
) {
  const { requestId } = await props.params;
  const { highlight } = await props.searchParams;

  return (
    <RequestDetailPageTemplate
      requestId={requestId}
      highlightCommentId={highlight}
    />
  );
}
