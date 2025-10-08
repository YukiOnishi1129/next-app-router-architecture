import "server-only";

import type { RequestStatus } from "@/features/requests/types";
import { RequestStatusBadge } from "@/shared/components/ui/request-status-badge";

type RequestDetailPageTemplateProps = {
  requestId: string;
  highlightCommentId?: string;
};

const statusOrder: RequestStatus[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
];

export async function RequestDetailPageTemplate({
  requestId,
  highlightCommentId,
}: RequestDetailPageTemplateProps) {
  return (
    <section className="space-y-6 px-6 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Request Detail</h1>
          <p className="text-sm text-muted-foreground">
            Request ID: <span className="font-mono">{requestId}</span>
          </p>
        </div>
        <RequestStatusBadge status="submitted" />
      </header>

      <article className="space-y-4">
        <h2 className="text-lg font-medium">Summary</h2>
        <p className="text-sm text-muted-foreground">
          This is placeholder content for the request detail view. Integrate
          real data by connecting to the request query handler.
        </p>
      </article>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Status progression</h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          {statusOrder.map((status) => (
            <li key={status} className="flex items-center gap-2">
              <RequestStatusBadge status={status} />
              <span>Sample timestamp</span>
            </li>
          ))}
        </ol>
      </section>

      {highlightCommentId ? (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Highlighted comment</h2>
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
            Comment reference:{" "}
            <span className="font-mono">{highlightCommentId}</span>
          </div>
        </section>
      ) : null}
    </section>
  );
}
