import { RequestsPageTemplate } from "@/features/requests/components/server/RequestsPageTemplate";

export default async function RequestsPage(props: PageProps<"/requests">) {
  const { status } = await props.searchParams;

  return (
    <RequestsPageTemplate
      filters={{
        status: status as (typeof requestsStatus)[number] | undefined,
      }}
    />
  );
}

const requestsStatus = ["draft", "submitted", "approved", "rejected"] as const;
