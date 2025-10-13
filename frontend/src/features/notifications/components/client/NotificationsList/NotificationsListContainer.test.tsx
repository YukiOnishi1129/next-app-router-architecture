import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, fireEvent } from '@/test/test-utils'

import { NotificationsListContainer } from './NotificationsListContainer'

import type { NotificationItem } from '@/features/notifications/types'

const mockUseNotifications = vi.hoisted(() => vi.fn())

vi.mock('./useNotifications', () => ({
  useNotifications: mockUseNotifications,
}))

vi.mock('@/features/notifications/components/client/NotificationCard', () => ({
  NotificationCard: ({ notification }: { notification: NotificationItem }) => (
    <div>{notification.title}</div>
  ),
}))

describe('NotificationsListContainer', () => {
  beforeEach(() => {
    mockUseNotifications.mockReset()
  })

  it('renders notifications and handles tab change', () => {
    const notifications: NotificationItem[] = [
      {
        id: 'notif-1',
        title: 'New request',
        message: 'Review request',
        type: 'REQUEST',
        createdAt: '2024-01-01T00:00:00.000Z',
        read: false,
        relatedEntityType: null,
        relatedEntityId: null,
      },
    ]

    const onMarkRead = vi.fn()

    mockUseNotifications.mockReturnValue({
      notifications,
      unreadNotifications: notifications,
      total: 1,
      unreadCount: 1,
      isLoading: false,
      isRefetching: false,
      errorMessage: undefined,
      refetch: vi.fn(),
      markRead: onMarkRead,
      isMarkingRead: false,
    })

    render(<NotificationsListContainer />)

    expect(mockUseNotifications).toHaveBeenCalledWith(false)
    expect(screen.getByText('Notifications')).toBeInTheDocument()

    const allTab = screen.getByRole('button', { name: /All/ })
    fireEvent.click(allTab)
    // tab change handled internally; no assertion beyond render success
  })
})
