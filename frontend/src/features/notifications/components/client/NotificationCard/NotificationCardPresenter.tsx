'use client'

import Link from 'next/link'

import { Card } from '@/shared/components/ui/card'
import { formatDateTime, formatEnumLabel } from '@/shared/lib/format'

import type { NotificationItem } from '@/features/notifications/types'

export type NotificationCardPresenterProps = {
  notification: NotificationItem
  onClick: (notificationId: string) => Promise<void>
}

export function NotificationCardPresenter({
  notification,
  onClick,
}: NotificationCardPresenterProps) {
  return (
    <Card className="border-border/80 bg-background p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {formatEnumLabel(notification.type)}
          </p>
          <h2 className="text-base font-semibold">{notification.title}</h2>
        </div>
        <span className="text-muted-foreground text-xs">
          {formatDateTime(notification.createdAt, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      </div>
      <p className="text-muted-foreground text-sm">{notification.message}</p>
      {notification.relatedEntityId ? (
        <Link
          href={`/requests/${notification.relatedEntityId}`}
          className="text-primary hover:text-primary/80 text-xs font-medium"
          onClick={async () => {
            await onClick(notification.id)
          }}
        >
          View related request
        </Link>
      ) : null}
    </Card>
  )
}
