import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMarkNotificationReadMutation } from '@/features/notifications/hooks/mutation/useMarkNotificationReadMutation'
import { useNotificationsQuery } from '@/features/notifications/hooks/query/useNotificationsQuery'

import { act, renderHook } from '@/test/test-utils'

import { useNotifications } from './useNotifications'

vi.mock('@/features/notifications/hooks/query/useNotificationsQuery', () => ({
  useNotificationsQuery: vi.fn(),
}))

vi.mock(
  '@/features/notifications/hooks/mutation/useMarkNotificationReadMutation',
  () => ({
    useMarkNotificationReadMutation: vi.fn(),
  })
)

const mockedUseNotificationsQuery = vi.mocked(useNotificationsQuery)
const mockedUseMarkReadMutation = vi.mocked(useMarkNotificationReadMutation)

describe('useNotifications', () => {
  beforeEach(() => {
    mockedUseNotificationsQuery.mockReset()
    mockedUseMarkReadMutation.mockReset()
  })

  const notificationDto = {
    id: 'notif-1',
    title: 'New request',
    message: 'Please review',
    type: 'REQUEST',
    createdAt: '2024-01-01T00:00:00.000Z',
    read: false,
    readAt: null,
    relatedEntityType: 'REQUEST',
    relatedEntityId: 'req-1',
  }

  it('maps notifications and exposes markRead', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockedUseNotificationsQuery.mockReturnValue({
      data: {
        success: true,
        notifications: [notificationDto],
        total: 1,
        unreadCount: 1,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useNotificationsQuery>)

    mockedUseMarkReadMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkNotificationReadMutation>)

    const { result } = renderHook(() => useNotifications())

    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.unreadCount).toBe(1)

    await act(async () => {
      await result.current.markRead({ notificationId: 'notif-1' })
    })

    expect(mutateAsync).toHaveBeenCalledWith({ notificationId: 'notif-1' })
  })

  it('returns loading and error states', () => {
    const error = new Error('Network')
    mockedUseNotificationsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useNotificationsQuery>)

    mockedUseMarkReadMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMarkNotificationReadMutation>)

    const { result } = renderHook(() => useNotifications(true))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorMessage).toBe('Network')
    expect(result.current.notifications).toEqual([])
  })
})
