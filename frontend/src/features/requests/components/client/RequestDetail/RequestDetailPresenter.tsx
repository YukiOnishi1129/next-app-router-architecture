'use client'

import { RequestHistory } from '@/features/requests/components/client/RequestHistory'

import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'
import { formatIdentity } from '@/shared/lib/presentation'

import type { RequestDetail } from '@/features/requests/types'

type RequestDetailPresenterProps = {
  request: RequestDetail | null
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
  highlightCommentId?: string | null
  canSubmit?: boolean
  onSubmit?: () => void
  isSubmitting?: boolean
  submitError?: string
  canApprove?: boolean
  canReject?: boolean
  canReopen?: boolean
  onApprove?: () => void
  onReopen?: () => void
  onReopenAndSubmit?: () => void
  onEdit?: () => void
  showRejectForm?: boolean
  rejectReason?: string
  rejectFormError?: string | null
  onRejectToggle?: () => void
  onRejectReasonChange?: (value: string) => void
  onRejectSubmit?: () => void
  isApproving?: boolean
  isRejecting?: boolean
  isReopening?: boolean
  isResubmitting?: boolean
  approveError?: string
  rejectError?: string
  reopenError?: string
  approveSuccessMessage?: string | null
  rejectSuccessMessage?: string | null
  reopenSuccessMessage?: string | null
}

export function RequestDetailPresenter({
  request,
  isLoading,
  isRefetching,
  errorMessage,
  highlightCommentId,
  canSubmit = false,
  onSubmit,
  isSubmitting = false,
  submitError,
  canApprove = false,
  canReject = false,
  canReopen = false,
  onApprove,
  onReopen,
  onReopenAndSubmit,
  onEdit,
  showRejectForm = false,
  rejectReason = '',
  rejectFormError,
  onRejectToggle,
  onRejectReasonChange,
  onRejectSubmit,
  isApproving = false,
  isRejecting = false,
  isReopening = false,
  isResubmitting = false,
  approveError,
  rejectError,
  reopenError,
  approveSuccessMessage = null,
  rejectSuccessMessage = null,
  reopenSuccessMessage = null,
}: RequestDetailPresenterProps) {
  if (errorMessage) {
    return (
      <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
        {errorMessage}
      </div>
    )
  }

  if (isLoading || !request) {
    return (
      <div className="space-y-3">
        <div className="border-border bg-muted/30 h-24 animate-pulse rounded-md border" />
        <div className="border-border bg-muted/30 h-24 animate-pulse rounded-md border" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{request.title}</h1>
            <p className="text-muted-foreground text-sm">
              {formatEnumLabel(request.type)} ·{' '}
              {formatEnumLabel(request.priority)}
            </p>
          </div>
          <RequestStatusBadge status={request.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {canApprove ? (
            <Button
              type="button"
              variant="default"
              disabled={
                isApproving || isRejecting || isReopening || isResubmitting
              }
              onClick={() => onApprove?.()}
            >
              {isApproving ? 'Approving…' : 'Approve'}
            </Button>
          ) : null}
          {canReject ? (
            <Button
              type="button"
              variant="outline"
              disabled={
                isApproving || isRejecting || isReopening || isResubmitting
              }
              onClick={() => onRejectToggle?.()}
            >
              {showRejectForm ? 'Cancel' : 'Reject'}
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isReopening || isResubmitting}
              onClick={() => onEdit?.()}
            >
              Edit request
            </Button>
          ) : null}
          {canReopen ? (
            <Button
              type="button"
              variant="outline"
              disabled={isReopening || isResubmitting}
              onClick={() => onReopen?.()}
            >
              {isReopening ? 'Reopening…' : 'Reopen request'}
            </Button>
          ) : null}
          {canReopen ? (
            <Button
              type="button"
              variant="outline"
              disabled={
                isReopening || isResubmitting || isApproving || isRejecting
              }
              onClick={() => onReopenAndSubmit?.()}
            >
              {isResubmitting ? 'Resubmitting…' : 'Reopen & submit'}
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting || isReopening || isResubmitting}
              onClick={() => onSubmit?.()}
            >
              {isSubmitting ? 'Submitting…' : 'Submit request'}
            </Button>
          ) : null}
        </div>
      </header>

      {isRefetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}

      {approveSuccessMessage ? (
        <div className="text-primary border-primary/40 bg-primary/10 rounded-md border p-4 text-sm">
          {approveSuccessMessage}
        </div>
      ) : null}
      {rejectSuccessMessage ? (
        <div className="text-primary border-primary/40 bg-primary/10 rounded-md border p-4 text-sm">
          {rejectSuccessMessage}
        </div>
      ) : null}
      {reopenSuccessMessage ? (
        <div className="text-primary border-primary/40 bg-primary/10 rounded-md border p-4 text-sm">
          {reopenSuccessMessage}
        </div>
      ) : null}

      {approveError ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {approveError}
        </div>
      ) : null}
      {rejectError ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {rejectError}
        </div>
      ) : null}
      {reopenError ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {reopenError}
        </div>
      ) : null}
      {submitError ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {submitError}
        </div>
      ) : null}

      {showRejectForm ? (
        <Card className="space-y-3 p-4">
          <section className="space-y-2">
            <div>
              <h2 className="text-base font-semibold">Reject request</h2>
              <p className="text-muted-foreground text-xs">
                Share a brief reason so the requester knows what to adjust.
              </p>
            </div>
            <textarea
              className="border-border focus-visible:ring-primary/80 bg-background min-h-[120px] w-full rounded-md border p-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              value={rejectReason}
              onChange={(event) => onRejectReasonChange?.(event.target.value)}
              disabled={isRejecting}
              placeholder="Reason for rejecting this request"
            />
            {rejectFormError ? (
              <p className="text-destructive text-xs">{rejectFormError}</p>
            ) : null}
          </section>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRejectToggle?.()}
              disabled={isRejecting}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={isRejecting || !rejectReason?.trim()}
              onClick={() => onRejectSubmit?.()}
            >
              {isRejecting ? 'Rejecting…' : 'Submit rejection'}
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4 p-6">
        <section className="space-y-1">
          <h2 className="text-lg font-medium">Description</h2>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">
            {request.description}
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <dl className="text-muted-foreground space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium">Type</dt>
              <dd>{formatEnumLabel(request.type)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Priority</dt>
              <dd>{formatEnumLabel(request.priority)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Requester</dt>
              <dd>{formatIdentity(request.requesterName)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Assignee</dt>
              <dd>{formatIdentity(request.assigneeName, 'Unassigned')}</dd>
            </div>
          </dl>
          <dl className="text-muted-foreground space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium">Created</dt>
              <dd>{formatDateTime(request.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Updated</dt>
              <dd>{formatDateTime(request.updatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Submitted</dt>
              <dd>{formatDateTime(request.submittedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Reviewed</dt>
              <dd>{formatDateTime(request.reviewedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Reviewer</dt>
              <dd>{formatIdentity(request.reviewerName)}</dd>
            </div>
          </dl>
        </section>
      </Card>

      {highlightCommentId ? (
        <Card className="space-y-2 p-4 text-sm">
          <h2 className="text-lg font-medium">Highlighted comment</h2>
          <p>
            Comment reference:{' '}
            <span className="font-mono">{highlightCommentId}</span>
          </p>
        </Card>
      ) : null}

      <RequestHistory requestId={request.id} />
    </div>
  )
}
