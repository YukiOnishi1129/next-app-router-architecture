'use client'

import Link from 'next/link'

import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

import type { RequestDto } from '@/external/dto/request'
import type { ApprovalsHistoryTab } from '@/features/approvals/types/history'

type ApprovalsHistoryPresenterProps = {
  tabs: ApprovalsHistoryTab[]
  items: RequestDto[]
  isLoading: boolean
  isRefetching: boolean
  error: unknown
}

export function ApprovalsHistoryPresenter({
  tabs,
  items,
  isLoading,
  isRefetching,
  error,
}: ApprovalsHistoryPresenterProps) {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              'rounded-md border px-4 py-2 text-sm transition',
              tab.isActive
                ? 'border-primary bg-primary text-primary-foreground shadow'
                : 'border-border text-muted-foreground hover:border-muted-foreground'
            )}
            aria-current={tab.isActive ? 'page' : undefined}
          >
            <div className="flex items-center gap-2">
              <span>{tab.label}</span>
              <span className="bg-background/80 rounded-full px-2 py-0.5 text-xs font-medium">
                {tab.count}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {tab.description}
            </p>
          </Link>
        ))}
      </nav>

      {error ? (
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {error instanceof Error ? error.message : 'Failed to load history.'}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <div className="border-border bg-muted/30 h-24 animate-pulse rounded-md border" />
          <div className="border-border bg-muted/30 h-24 animate-pulse rounded-md border" />
        </div>
      ) : !error && items.length === 0 ? (
        <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
          No requests found for this tab yet.
        </div>
      ) : !error ? (
        <div className="space-y-3">
          {isRefetching ? (
            <p className="text-muted-foreground text-xs">Refreshing…</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Card className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">{request.title}</h3>
                      <p className="text-muted-foreground text-xs">
                        Requested by {request.requesterName ?? 'Unknown'}
                      </p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  <dl className="text-muted-foreground grid grid-cols-2 gap-1 text-xs">
                    <dt>Type</dt>
                    <dd className="text-right">
                      {formatEnumLabel(request.type)}
                    </dd>
                    <dt>Priority</dt>
                    <dd className="text-right">
                      {formatEnumLabel(request.priority)}
                    </dd>
                    <dt>Submitted</dt>
                    <dd className="text-right">
                      {formatDateTime(request.submittedAt, {
                        dateStyle: 'medium',
                      }) ?? '—'}
                    </dd>
                    <dt>Reviewed</dt>
                    <dd className="text-right">
                      {formatDateTime(request.reviewedAt ?? null, {
                        dateStyle: 'medium',
                      }) ?? '—'}
                    </dd>
                  </dl>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
