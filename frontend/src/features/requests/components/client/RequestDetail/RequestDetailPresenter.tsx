'use client'

import { useEffect, useState } from 'react'

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
  onReject?: (reason: string) => void
  onReopen?: () => void
  isApproving?: boolean
  isRejecting?: boolean
  isReopening?: boolean
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
  onReject,
  onReopen,
  isApproving = false,
  isRejecting = false,
  isReopening = false,
  approveError,
  rejectError,
  reopenError,
  approveSuccessMessage = null,
  rejectSuccessMessage = null,
  reopenSuccessMessage = null,
}: RequestDetailPresenterProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectFormError, setRejectFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!canReject) {
      setShowRejectForm(false)
      setRejectReason('')
      setRejectFormError(null)
    }
  }, [canReject])

  useEffect(() => {
    if (rejectSuccessMessage) {
      setShowRejectForm(false)
      setRejectReason('')
      setRejectFormError(null)
    }
  }, [rejectSuccessMessage])

  const handleApproveClick = () => {
    if (!onApprove) {
      return
    }
    onApprove()
  }

  const handleRejectToggle = () => {
    setShowRejectForm((prev) => !prev)
    setRejectFormError(null)
  }

  const handleRejectSubmit = () => {
    if (!onReject) {
      return
    }
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setRejectFormError('Please provide a rejection reason.')
      return
    }
    setRejectFormError(null)
    onReject(trimmed)
  }

  const handleReopenClick = () => {
    if (!onReopen) {
      return
    }
    onReopen()
  }

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

      {approveSuccessMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {approveSuccessMessage}
        </div>
      ) : null}
      {rejectSuccessMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {rejectSuccessMessage}
        </div>
      ) : null}
      {reopenSuccessMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {reopenSuccessMessage}
        </div>
      ) : null}

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{request.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {canApprove ? (
            <Button
              type="button"
              disabled={isApproving || isRejecting || isReopening}
              onClick={handleApproveClick}
            >
              {isApproving ? 'Approving…' : 'Approve'}
            </Button>
          ) : null}
          {canReject ? (
            <Button
              type="button"
              variant="outline"
              disabled={isApproving || isRejecting || isReopening}
              onClick={handleRejectToggle}
            >
              {showRejectForm ? 'Cancel' : 'Reject'}
            </Button>
          ) : null}
          {canReopen ? (
            <Button
              type="button"
              variant="outline"
              disabled={isReopening}
              onClick={handleReopenClick}
            >
              {isReopening ? 'Reopening…' : 'Reopen request'}
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="button"
              variant="default"
              disabled={isSubmitting || isReopening}
              onClick={onSubmit}
            >
              {isSubmitting ? 'Submitting…' : 'Submit request'}
            </Button>
          ) : null}
          <RequestStatusBadge status={request.status} />
        </div>
      </header>

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
              onChange={(event) => setRejectReason(event.target.value)}
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
              onClick={handleRejectToggle}
              disabled={isRejecting}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={isRejecting || !rejectReason.trim()}
              onClick={handleRejectSubmit}
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
