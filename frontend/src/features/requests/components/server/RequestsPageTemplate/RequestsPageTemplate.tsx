import "server-only";

import type { RequestFilterInput } from "@/features/requests/types";
import { RequestList } from "@/features/requests/components/client/RequestList";

type RequestsPageTemplateProps = {
  filters?: RequestFilterInput;
};

export async function RequestsPageTemplate({
  filters = {},
}: RequestsPageTemplateProps) {
  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your pending and completed approval requests.
        </p>
      </header>

      <RequestList filters={filters} />
    </section>
  );
}
