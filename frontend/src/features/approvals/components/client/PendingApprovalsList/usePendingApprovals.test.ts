import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePendingApprovalsQuery } from '@/features/approvals/hooks/query/usePendingApprovalsQuery'
import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { act, renderHook } from '@/test/test-utils'

import { usePendingApprovals } from './usePendingApprovals'

vi.useFakeTimers()

vi.mock('@/features/approvals/hooks/query/usePendingApprovalsQuery', () => ({
  usePendingApprovalsQuery: vi.fn(),
}))

const mockedUsePendingApprovalsQuery = vi.mocked(usePendingApprovalsQuery)

describe('usePendingApprovals', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    mockedUsePendingApprovalsQuery.mockReset()
  })

  const pendingDto = {
    id: 'req-1',
    title: 'Review access request',
    status: RequestStatus.SUBMITTED,
    type: RequestType.ACCESS,
    priority: RequestPriority.MEDIUM,
    requesterName: 'Alice',
    submittedAt: '2024-01-01T00:00:00.000Z',
  }

  it('maps pending approvals and exposes success handler', () => {
    mockedUsePendingApprovalsQuery.mockReturnValue({
      data: [pendingDto],
      isLoading: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof usePendingApprovalsQuery>)

    const { result } = renderHook(() => usePendingApprovals())

    expect(result.current.approvals).toEqual([pendingDto])
    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.handleActionComplete('approve')
    })

    expect(result.current.successMessage).toBe('Request approved successfully.')

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(result.current.successMessage).toBeNull()
  })

  it('propagates errors', () => {
    const error = new Error('Failed')
    mockedUsePendingApprovalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error,
    } as unknown as ReturnType<typeof usePendingApprovalsQuery>)

    const { result } = renderHook(() => usePendingApprovals())

    expect(result.current.approvals).toEqual([])
    expect(result.current.errorMessage).toBe('Failed')
  })
})
