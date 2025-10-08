"use client";

import { Card } from "@/shared/components/ui/card";
import { RequestStatusBadge } from "@/shared/components/ui/request-status-badge";

import type { RequestSummary } from "@/features/requests/types";

type RequestListPresenterProps = {
  requests: RequestSummary[];
  isLoading?: boolean;
};

export function RequestListPresenter({
  requests,
  isLoading,
}: RequestListPresenterProps) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground space-y-2 text-sm">
        Loading requests...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
        No requests found. Try creating a new one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => (
        <Card key={request.id} className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{request.title}</h3>
            <RequestStatusBadge status={request.status} />
          </div>
          <dl className="text-muted-foreground grid grid-cols-2 gap-1 text-xs">
            <dt>Submitted</dt>
            <dd className="text-right">
              {new Date(request.submittedAt).toLocaleDateString()}
            </dd>
            <dt>Amount</dt>
            <dd className="text-right">
              {typeof request.amount === "number"
                ? `$${request.amount.toFixed(2)}`
                : "—"}
            </dd>
          </dl>
        </Card>
      ))}
    </div>
  );
}
