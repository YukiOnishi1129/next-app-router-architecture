'use client'

import { Card } from '@/shared/components/ui/card'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'

import type {
  RequestAuditLogEntry,
  RequestNotificationEntry,
} from '@/features/requests/types'

type RequestHistoryPresenterProps = {
  auditLogs: RequestAuditLogEntry[]
  notifications: RequestNotificationEntry[]
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
}

export function RequestHistoryPresenter({
  auditLogs,
  notifications,
  isLoading = false,
  isRefetching = false,
  errorMessage,
}: RequestHistoryPresenterProps) {
  if (errorMessage) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
          {errorMessage}
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">History</h2>
        <p className="text-muted-foreground text-sm">Loading history…</p>
      </section>
    )
  }

  const hasHistory = auditLogs.length > 0 || notifications.length > 0

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">History</h2>
        {isRefetching ? (
          <span className="text-muted-foreground text-xs">Refreshing…</span>
        ) : null}
      </div>

      {!hasHistory ? (
        <div className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          No audit activity or notifications logged for this request yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-4">
          <header className="space-y-1">
            <h3 className="text-base font-semibold">Audit trail</h3>
            <p className="text-muted-foreground text-xs">
              Track approval actions and request changes.
            </p>
          </header>
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No audit entries yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {auditLogs.map((log) => {
                const comment =
                  log.metadata && typeof log.metadata['comment'] === 'string'
                    ? (log.metadata['comment'] as string)
                    : null

                return (
                  <li
                    key={log.id}
                    className="border-border/60 rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {formatEnumLabel(log.eventType)}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(log.createdAt, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {log.description}
                      {log.actorName ? ` — ${log.actorName}` : ''}
                    </p>
                    {comment ? (
                      <p className="bg-muted/60 mt-2 rounded-md p-2 text-xs">
                        Comment: {comment}
                      </p>
                    ) : null}
                    {log.changes ? (
                      <dl className="mt-2 space-y-1 text-xs">
                        {Object.entries(log.changes).map(([field, change]) => (
                          <div key={field} className="grid grid-cols-3 gap-2">
                            <dt className="text-muted-foreground">{field}</dt>
                            <dd className="col-span-2">
                              {JSON.stringify(change.new)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <header className="space-y-1">
            <h3 className="text-base font-semibold">Notifications</h3>
            <p className="text-muted-foreground text-xs">
              Messages sent when the request status changed.
            </p>
          </header>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No notifications were sent for this request.
            </p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="border-border/60 rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-muted-foreground text-xs">
                      {formatDateTime(notification.createdAt, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {notification.message}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Type: {formatEnumLabel(notification.type)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  )
}
