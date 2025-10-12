'use client'

import { NotificationCard } from '@/features/notifications/components/client/NotificationCard'

import { cn } from '@/shared/lib/utils'

import type { NotificationCardProps } from '@/features/notifications/components/client/NotificationCard'
import type { NotificationItem } from '@/features/notifications/types'

export type NotificationsListPresenterProps = {
  notifications: NotificationItem[]
  unreadNotifications: NotificationItem[]
  total: number
  unreadCount: number
  isLoading?: boolean
  isRefetching?: boolean
  errorMessage?: string
  activeTab: 'unread' | 'all'
  onTabChange: (tab: 'unread' | 'all') => void
  onNotificationClick: NotificationCardProps['onClick']
}

export function NotificationsListPresenter({
  notifications,
  unreadNotifications,
  total,
  unreadCount,
  isLoading = false,
  isRefetching = false,
  errorMessage,
  activeTab,
  onTabChange,
  onNotificationClick,
}: NotificationsListPresenterProps) {
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
        Loading notifications…
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Stay up to date with approval decisions and request changes.
          </p>
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{total}</span> total ·{' '}
          <span className="text-foreground font-medium">{unreadCount}</span>{' '}
          unread
        </div>
      </header>

      {isRefetching ? (
        <p className="text-muted-foreground text-xs">Refreshing…</p>
      ) : null}

      <div className="space-y-4">
        <div className="border-border flex items-center gap-2 border-b pb-1 text-sm font-medium">
          <button
            type="button"
            className={cn(
              'rounded-full px-3 py-1 transition',
              activeTab === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => onTabChange('unread')}
          >
            Unread ({unreadNotifications.length})
          </button>
          <button
            type="button"
            className={cn(
              'rounded-full px-3 py-1 transition',
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => onTabChange('all')}
          >
            All ({notifications.length})
          </button>
        </div>

        <section className="space-y-3">
          {activeTab === 'unread' && unreadNotifications.length === 0 ? (
            <p className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
              You&apos;re all caught up.
            </p>
          ) : null}

          {activeTab === 'all' && notifications.length === 0 ? (
            <p className="border-muted-foreground/40 text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
              You have no notifications yet.
            </p>
          ) : null}

          <div className="space-y-3">
            {(activeTab === 'unread' ? unreadNotifications : notifications).map(
              (notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={onNotificationClick}
                />
              )
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
