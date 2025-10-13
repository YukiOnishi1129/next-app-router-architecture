import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRequestHistoryQuery } from '@/features/requests/hooks/query/useRequestHistoryQuery'

import { renderHook } from '@/test/test-utils'

import { useRequestHistory } from './useRequestHistory'

vi.mock('@/features/requests/hooks/query/useRequestHistoryQuery', () => ({
  useRequestHistoryQuery: vi.fn(),
}))

const mockedUseRequestHistoryQuery = vi.mocked(useRequestHistoryQuery)

describe('useRequestHistory', () => {
  beforeEach(() => {
    mockedUseRequestHistoryQuery.mockReset()
  })

  const baseResponse = {
    success: true,
    auditLogs: [
      {
        id: 'log-1',
        eventType: 'REQUEST_CREATED',
        description: 'Request created',
        actorName: 'Alice',
        createdAt: '2024-01-01T00:00:00.000Z',
        metadata: null,
        changes: null,
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'New request',
        message: 'Request submitted',
        type: 'REQUEST',
        createdAt: '2024-01-01T00:00:00.000Z',
        read: false,
        readAt: null,
        relatedEntityType: 'REQUEST',
        relatedEntityId: 'req-1',
      },
    ],
  }

  it('maps audit logs and notifications', () => {
    mockedUseRequestHistoryQuery.mockReturnValue({
      data: baseResponse,
      isLoading: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useRequestHistoryQuery>)

    const { result } = renderHook(() => useRequestHistory('req-1'))

    expect(result.current.auditLogs).toHaveLength(1)
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isRefetching).toBe(false)
    expect(result.current.errorMessage).toBeUndefined()
  })

  it('handles loading and errors', () => {
    const error = new Error('Unable to load')
    mockedUseRequestHistoryQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error,
    } as unknown as ReturnType<typeof useRequestHistoryQuery>)

    const { result } = renderHook(() => useRequestHistory('req-1'))

    expect(result.current.auditLogs).toEqual([])
    expect(result.current.notifications).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isRefetching).toBe(false)
    expect(result.current.errorMessage).toBe('Unable to load')
  })
})
