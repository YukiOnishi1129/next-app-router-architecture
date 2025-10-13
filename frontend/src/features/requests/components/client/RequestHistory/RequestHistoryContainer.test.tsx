import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { RequestHistoryContainer } from './RequestHistoryContainer'

const mockUseRequestHistory = vi.hoisted(() => vi.fn())

vi.mock('./useRequestHistory', () => ({
  useRequestHistory: mockUseRequestHistory,
}))

describe('RequestHistoryContainer', () => {
  beforeEach(() => {
    mockUseRequestHistory.mockReset()
  })

  it('renders audit logs and notifications', () => {
    mockUseRequestHistory.mockReturnValue({
      auditLogs: [
        {
          id: 'log-1',
          eventType: 'REQUEST_CREATED',
          description: 'Created',
          actorName: 'Alice',
          createdAt: '2024-01-01T00:00:00.000Z',
          metadata: null,
          changes: null,
        },
      ],
      notifications: [],
      isLoading: false,
      isRefetching: false,
      errorMessage: undefined,
    })

    render(<RequestHistoryContainer requestId="req-1" />)

    expect(mockUseRequestHistory).toHaveBeenCalledWith('req-1')
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('renders loading indicator', () => {
    mockUseRequestHistory.mockReturnValue({
      auditLogs: [],
      notifications: [],
      isLoading: true,
      isRefetching: false,
      errorMessage: undefined,
    })

    render(<RequestHistoryContainer requestId="req-1" />)

    expect(screen.getByText('Loading history…')).toBeInTheDocument()
  })

  it('renders error message', () => {
    mockUseRequestHistory.mockReturnValue({
      auditLogs: [],
      notifications: [],
      isLoading: false,
      isRefetching: false,
      errorMessage: 'Failed to load',
    })

    render(<RequestHistoryContainer requestId="req-1" />)

    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
