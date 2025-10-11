'use client'

import type { ReactNode } from 'react'

type PendingApprovalsListPresenterProps = {
  cards: ReactNode[]
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
  successMessage?: string | null
}

export function PendingApprovalsListPresenter({
  cards,
  isLoading,
  isRefetching,
  errorMessage,
  successMessage = null,
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

  if (!cards.length) {
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
      <div className="grid gap-4 md:grid-cols-2">{cards}</div>
    </div>
  )
}
