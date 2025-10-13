import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useReviewedApprovalsQuery } from '@/features/approvals/hooks/query/useReviewedApprovalsQuery'
import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { renderHook } from '@/test/test-utils'

import { useApprovalsHistory } from './useApprovalsHistory'

vi.mock('@/features/approvals/hooks/query/useReviewedApprovalsQuery', () => ({
  useReviewedApprovalsQuery: vi.fn(),
}))

const mockedUseReviewedApprovalsQuery = vi.mocked(useReviewedApprovalsQuery)

describe('useApprovalsHistory', () => {
  beforeEach(() => {
    mockedUseReviewedApprovalsQuery.mockReset()
  })

  const summary = { approved: 3, rejected: 2 }
  const approvedRequest = {
    id: 'req-1',
    title: 'New hardware',
    description: 'Laptops',
    status: RequestStatus.APPROVED,
    type: RequestType.EQUIPMENT,
    priority: RequestPriority.MEDIUM,
    requesterId: 'user-1',
    requesterName: 'Alice',
    assigneeId: null,
    assigneeName: null,
    reviewerId: 'admin-1',
    reviewerName: 'Admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    submittedAt: '2024-01-01T12:00:00.000Z',
    reviewedAt: '2024-01-02T12:00:00.000Z',
  }
  const rejectedRequest = {
    ...approvedRequest,
    id: 'req-2',
    status: RequestStatus.REJECTED,
  }

  it('maps tabs and filters items by status', () => {
    mockedUseReviewedApprovalsQuery.mockReturnValue({
      data: [approvedRequest, rejectedRequest],
      isLoading: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useReviewedApprovalsQuery>)

    const { result } = renderHook(() =>
      useApprovalsHistory({ status: RequestStatus.APPROVED, summary })
    )

    expect(result.current.tabs).toHaveLength(2)
    const activeTab = result.current.tabs.find((tab) => tab.isActive)
    expect(activeTab?.key).toBe(RequestStatus.APPROVED)
    expect(activeTab?.count).toBe(summary.approved)

    expect(result.current.items).toEqual([approvedRequest])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('propagates loading and errors', () => {
    const error = new Error('Failed to load')
    mockedUseReviewedApprovalsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error,
    } as unknown as ReturnType<typeof useReviewedApprovalsQuery>)

    const { result } = renderHook(() =>
      useApprovalsHistory({ status: RequestStatus.REJECTED, summary })
    )

    expect(result.current.items).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(error)
  })
})
