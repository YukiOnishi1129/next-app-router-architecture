'use client'

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
}: RequestDetailPresenterProps) {
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
        Loading request details...
      </div>
    )
  }

  if (!request) {
    return (
      <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
        Request not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isRefetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{request.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {canSubmit ? (
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? 'Submitting…' : 'Submit request'}
            </Button>
          ) : null}
          <RequestStatusBadge status={request.status} />
        </div>
      </header>

      {submitError ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {submitError}
        </div>
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
    </div>
  )
}
