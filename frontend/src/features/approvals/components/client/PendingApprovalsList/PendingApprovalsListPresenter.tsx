'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'
import { formatIdentity } from '@/shared/lib/presentation'

import type { PendingApproval } from '@/features/approvals/types'

type LastAction =
  | {
      type: 'approve'
      requestId: string
    }
  | {
      type: 'reject'
      requestId: string
    }
  | null

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
  onReject: (requestId: string, reason: string) => void
  approvingRequestId?: string | null
  rejectingRequestId?: string | null
  approveError?: ActionError
  rejectError?: ActionError
  successMessage?: string | null
  lastAction?: LastAction
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
  successMessage = null,
  lastAction = null,
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
      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
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
            <PendingApprovalCard
              key={approval.id}
              approval={approval}
              isApproving={approving}
              isRejecting={rejecting}
              errorMessage={cardError}
              onApprove={onApprove}
              onReject={onReject}
              lastAction={lastAction}
            />
          )
        })}
      </div>
    </div>
  )
}

type PendingApprovalCardProps = {
  approval: PendingApproval
  onApprove: (requestId: string) => void
  onReject: (requestId: string, reason: string) => void
  isApproving: boolean
  isRejecting: boolean
  errorMessage?: string | null
  lastAction?: LastAction
}

function PendingApprovalCard({
  approval,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  errorMessage,
  lastAction = null,
}: PendingApprovalCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectFormError, setRejectFormError] = useState<string | null>(null)

  const disableActions = isApproving || isRejecting
  const trimmedReason = rejectReason.trim()
  const isLastActionForRequest =
    lastAction?.requestId === approval.id ? lastAction.type : null

  const handleApprove = () => {
    if (disableActions) {
      return
    }
    onApprove(approval.id)
  }

  const handleToggleReject = () => {
    setShowRejectForm((prev) => {
      const next = !prev
      if (!next) {
        setRejectReason('')
        setRejectFormError(null)
      }
      return next
    })
  }

  const handleRejectSubmit = () => {
    if (!trimmedReason) {
      setRejectFormError('Please provide a rejection reason.')
      return
    }
    setRejectFormError(null)
    onReject(approval.id, trimmedReason)
  }

  useEffect(() => {
    if (
      lastAction &&
      lastAction.requestId === approval.id &&
      lastAction.type === 'reject'
    ) {
      setShowRejectForm(false)
      setRejectReason('')
      setRejectFormError(null)
    }
  }, [approval.id, lastAction])

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
            onChange={(event) => setRejectReason(event.target.value)}
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
              onClick={handleToggleReject}
              disabled={isRejecting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleRejectSubmit}
              disabled={isRejecting || !trimmedReason}
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
        {!showRejectForm && isLastActionForRequest ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {isLastActionForRequest === 'approve'
              ? 'Approved successfully.'
              : 'Rejected successfully.'}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleApprove}
            disabled={disableActions}
          >
            {isApproving ? 'Approving…' : 'Approve'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleReject}
            disabled={disableActions}
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
