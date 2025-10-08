import { RequestsPageTemplate } from "@/features/requests/components/server/RequestsPageTemplate";

export default async function RequestsPage(props: PageProps<"/requests">) {
  const { status } = await props.searchParams;

  return (
    <RequestsPageTemplate
      filters={{
        status: normalizeStatus(status),
      }}
    />
  );
}

const REQUEST_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
] as const;

type RequestStatusFilter = (typeof REQUEST_STATUSES)[number];

const normalizeStatus = (
  rawStatus: string | undefined
): RequestStatusFilter | undefined =>
  REQUEST_STATUSES.find(
    (candidate): candidate is RequestStatusFilter => candidate === rawStatus
  );
