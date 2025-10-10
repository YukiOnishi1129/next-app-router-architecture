'use client'

import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'

import type { RequestSummary } from '@/features/requests/types'

type RequestListPresenterProps = {
  requests: RequestSummary[]
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
}

const formatDate = (value: string | null) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleDateString()
}

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export function RequestListPresenter({
  requests,
  isLoading,
  isRefetching,
  errorMessage,
}: RequestListPresenterProps) {
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
        Loading requests...
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
        No requests found. Try creating a new one.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {isRefetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <Card key={request.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{request.title}</h3>
              <RequestStatusBadge status={request.status} />
            </div>
            <dl className="text-muted-foreground grid grid-cols-2 gap-1 text-xs">
              <dt>Type</dt>
              <dd className="text-right">{formatLabel(request.type)}</dd>
              <dt>Priority</dt>
              <dd className="text-right">{formatLabel(request.priority)}</dd>
              <dt>Created</dt>
              <dd className="text-right">{formatDate(request.createdAt)}</dd>
              <dt>Submitted</dt>
              <dd className="text-right">{formatDate(request.submittedAt)}</dd>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  )
}
