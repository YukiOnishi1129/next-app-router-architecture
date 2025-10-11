'use client'

import Link from 'next/link'

import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'
import { formatIdentity } from '@/shared/lib/presentation'

import type { PendingApproval } from '@/features/approvals/types'

type PendingApprovalCardPresenterProps = {
  approval: PendingApproval
  showRejectForm: boolean
  rejectReason: string
  rejectFormError?: string | null
  isApproving: boolean
  isRejecting: boolean
  errorMessage?: string | null
  successState: 'approve' | 'reject' | null
  onApprove: () => void
  onToggleReject: () => void
  onRejectReasonChange: (value: string) => void
  onRejectSubmit: () => void
}

export function PendingApprovalCardPresenter({
  approval,
  showRejectForm,
  rejectReason,
  rejectFormError,
  isApproving,
  isRejecting,
  errorMessage,
  successState,
  onApprove,
  onToggleReject,
  onRejectReasonChange,
  onRejectSubmit,
}: PendingApprovalCardPresenterProps) {
  const actionsDisabled = isApproving || isRejecting
  const successMessage =
    successState === 'approve'
      ? 'Approved successfully.'
      : successState === 'reject'
        ? 'Rejected successfully.'
        : null

  return (
    <Card className="flex h-full flex-col gap-3 p-4">
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

      {showRejectForm ? (
        <section className="border-border bg-muted/40 space-y-2 rounded-md border p-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Reject request</h3>
            <p className="text-muted-foreground text-xs">
              Explain why this request cannot move forward.
            </p>
          </div>
          <textarea
            className="border-border focus-visible:ring-primary/80 bg-background min-h-[96px] w-full rounded-md border p-2 text-xs focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(event) => onRejectReasonChange(event.target.value)}
            disabled={isRejecting}
          />
          {rejectFormError ? (
            <p className="text-destructive text-xs">{rejectFormError}</p>
          ) : null}
          {errorMessage ? (
            <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-2 text-xs">
              {errorMessage}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onToggleReject}
              disabled={isRejecting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onRejectSubmit}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? 'Rejecting…' : 'Submit rejection'}
            </Button>
          </div>
        </section>
      ) : null}

      <footer className="mt-auto space-y-2">
        {!showRejectForm && errorMessage ? (
          <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-3 text-xs">
            {errorMessage}
          </div>
        ) : null}
        {!showRejectForm && successMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApprove} disabled={actionsDisabled}>
            {isApproving ? 'Approving…' : 'Approve'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onToggleReject}
            disabled={actionsDisabled}
          >
            {showRejectForm ? 'Cancel' : 'Reject'}
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
}
