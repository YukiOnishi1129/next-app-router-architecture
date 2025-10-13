import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { RequestListContainer } from './RequestListContainer'

import type { RequestSummary } from '@/features/requests/types'

const mockUseRequestList = vi.hoisted(() => vi.fn())

vi.mock('./useRequestList', () => ({
  useRequestList: mockUseRequestList,
}))

const summaries: RequestSummary[] = [
  {
    id: 'req-1',
    title: 'Purchase laptops',
    status: 'DRAFT',
    type: 'PROCUREMENT',
    priority: 'HIGH',
    createdAt: '2024-01-01T00:00:00.000Z',
    submittedAt: null,
  },
]

describe('RequestListContainer', () => {
  beforeEach(() => {
    mockUseRequestList.mockReset()
  })

  it('renders presenter with summaries', () => {
    mockUseRequestList.mockReturnValue({
      data: null,
      summaries,
      isLoading: false,
      isRefetching: false,
      errorMessage: undefined,
    })

    render(<RequestListContainer filters={{ mineOnly: true }} />)

    expect(mockUseRequestList).toHaveBeenCalledWith({
      filters: { mineOnly: true },
    })
    expect(screen.getByText('Purchase laptops')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    mockUseRequestList.mockReturnValue({
      data: null,
      summaries: [],
      isLoading: true,
      isRefetching: false,
      errorMessage: undefined,
    })

    render(<RequestListContainer filters={{ mineOnly: true }} />)

    expect(screen.getByText('Loading requests...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseRequestList.mockReturnValue({
      data: null,
      summaries: [],
      isLoading: false,
      isRefetching: false,
      errorMessage: 'Failed to load',
    })

    render(<RequestListContainer filters={{ mineOnly: true }} />)

    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
