'use client'

import Link from 'next/link'

import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'
import { formatIdentity } from '@/shared/lib/presentation'

import type { PendingApproval } from '@/features/approvals/types'

type ActionError = {
  requestId: string
  message: string
} | null

type PendingApprovalsListPresenterProps = {
  approvals: PendingApproval[]
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
  approvingRequestId?: string | null
  rejectingRequestId?: string | null
  approveError?: ActionError
  rejectError?: ActionError
}

export function PendingApprovalsListPresenter({
  approvals,
  isLoading,
  isRefetching,
  errorMessage,
  onApprove,
  onReject,
  approvingRequestId = null,
  rejectingRequestId = null,
  approveError = null,
  rejectError = null,
}: PendingApprovalsListPresenterProps) {
  if (errorMessage) {
    return (
      <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
        {errorMessage}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground space-y-2 text-sm">
        Loading pending approvals...
      </div>
    )
  }

  if (!approvals.length) {
    return (
      <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
        No requests need your approval right now.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isRefetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {approvals.map((approval) => {
          const approving = approvingRequestId === approval.id
          const rejecting = rejectingRequestId === approval.id
          const cardError =
            approveError?.requestId === approval.id
              ? approveError.message
              : rejectError?.requestId === approval.id
                ? rejectError.message
                : null

          return (
            <Card key={approval.id} className="flex h-full flex-col gap-3 p-4">
              <header className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">{approval.title}</h2>
                  <dl className="text-muted-foreground space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium">Requester</dt>
                      <dd>{formatIdentity(approval.requesterName)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium">Type</dt>
                      <dd>{formatEnumLabel(approval.type)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium">Priority</dt>
                      <dd>{formatEnumLabel(approval.priority)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium">Submitted</dt>
                      <dd>
                        {formatDateTime(approval.submittedAt, {
                          dateStyle: 'medium',
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>
                <RequestStatusBadge status={approval.status} />
              </header>

              <footer className="mt-auto space-y-2">
                {cardError ? (
                  <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-3 text-xs">
                    {cardError}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => onApprove(approval.id)}
                    disabled={approving || rejecting}
                  >
                    {approving ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onReject(approval.id)}
                    disabled={approving || rejecting}
                  >
                    {rejecting ? 'Rejecting…' : 'Reject'}
                  </Button>
                  <Link
                    href={`/requests/${approval.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition"
                  >
                    View details
                  </Link>
                </div>
              </footer>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
