import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { NotificationCardContainer } from './NotificationCardContainer'

import type { NotificationItem } from '@/features/notifications/types'

vi.mock('./NotificationCardPresenter', () => ({
  NotificationCardPresenter: ({
    notification,
  }: {
    notification: NotificationItem
  }) => <div>{notification.title}</div>,
}))

describe('NotificationCardContainer', () => {
  it('renders presenter with notification', () => {
    const notification: NotificationItem = {
      id: 'notif-1',
      title: 'Reminder',
      message: 'Check request',
      type: 'REQUEST',
      createdAt: '2024-01-01T00:00:00.000Z',
      read: false,
      readAt: null,
      relatedEntityType: null,
      relatedEntityId: null,
    }

    render(
      <NotificationCardContainer
        notification={notification}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText('Reminder')).toBeInTheDocument()
  })
})
