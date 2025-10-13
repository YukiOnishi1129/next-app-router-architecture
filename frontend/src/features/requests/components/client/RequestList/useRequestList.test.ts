import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useRequestListQuery } from '@/features/requests/hooks/query/useRequestListQuery'

import { renderHook } from '@/test/test-utils'

import { useRequestList } from './useRequestList'

vi.mock('@/features/requests/hooks/query/useRequestListQuery', () => ({
  useRequestListQuery: vi.fn(),
}))

const mockedUseRequestListQuery = vi.mocked(useRequestListQuery)

const mockRequest = {
  id: 'req-1',
  title: 'Purchase laptops',
  description: 'Need new devices',
  status: 'DRAFT',
  type: 'PROCUREMENT',
  priority: 'HIGH',
  requesterId: 'acc-1',
  requesterName: 'Alice',
  assigneeId: null,
  assigneeName: null,
  reviewerId: null,
  reviewerName: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  submittedAt: null,
  reviewedAt: null,
}

const baseResponse = {
  success: true,
  requests: [mockRequest],
  total: 1,
  limit: 50,
  offset: 0,
}

describe('useRequestList', () => {
  beforeEach(() => {
    mockedUseRequestListQuery.mockReset()
  })

  it('maps request summaries and loading flags', () => {
    mockedUseRequestListQuery.mockReturnValue({
      data: baseResponse,
      isPending: false,
      isFetching: false,
      error: undefined,
    })

    const { result } = renderHook(() =>
      useRequestList({ filters: { mineOnly: true } })
    )

    expect(result.current.data).toEqual(baseResponse)
    expect(result.current.summaries).toEqual([
      {
        id: 'req-1',
        title: 'Purchase laptops',
        status: 'DRAFT',
        type: 'PROCUREMENT',
        priority: 'HIGH',
        createdAt: '2024-01-01T00:00:00.000Z',
        submittedAt: null,
      },
    ])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isRefetching).toBe(false)
    expect(result.current.errorMessage).toBeUndefined()
  })

  it('derives loading and error states correctly', () => {
    const error = new Error('Network issue')
    mockedUseRequestListQuery.mockReturnValue({
      data: undefined,
      isPending: true,
      isFetching: false,
      error,
    })

    const { result } = renderHook(() =>
      useRequestList({ filters: { mineOnly: true } })
    )

    expect(result.current.summaries).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isRefetching).toBe(false)
    expect(result.current.errorMessage).toBe('Network issue')
  })

  it('flags refetching when fetching with existing data', () => {
    mockedUseRequestListQuery.mockReturnValue({
      data: baseResponse,
      isPending: false,
      isFetching: true,
      error: undefined,
    })

    const { result } = renderHook(() =>
      useRequestList({ filters: { mineOnly: true } })
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isRefetching).toBe(true)
  })
})
