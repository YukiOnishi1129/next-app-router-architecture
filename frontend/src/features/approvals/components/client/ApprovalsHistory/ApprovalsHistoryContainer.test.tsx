import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { ApprovalsHistoryContainer } from './ApprovalsHistoryContainer'

const mockUseApprovalsHistory = vi.hoisted(() => vi.fn())

type MockedHookReturn = {
  tabs: Array<{
    key: RequestStatus
    label: string
    description: string
    href: string
    count: number
    isActive: boolean
  }>
  items: Array<{
    id: string
    title: string
    description: string
    status: RequestStatus
    type: RequestType
    priority: RequestPriority
    requesterId: string
    requesterName: string | null
    assigneeId: string | null
    assigneeName: string | null
    reviewerId: string | null
    reviewerName: string | null
    createdAt: string
    updatedAt: string
    submittedAt: string | null
    reviewedAt: string | null
  }>
  isLoading: boolean
  isRefetching: boolean
  error: unknown
}

vi.mock('./useApprovalsHistory', () => ({
  useApprovalsHistory: (args: {
    status: RequestStatus
    summary: { approved: number; rejected: number }
  }) => mockUseApprovalsHistory(args) as MockedHookReturn,
}))

describe('ApprovalsHistoryContainer', () => {
  beforeEach(() => {
    mockUseApprovalsHistory.mockReset()
  })

  it('renders tabs and items', () => {
    mockUseApprovalsHistory.mockReturnValue({
      tabs: [
        {
          key: RequestStatus.APPROVED,
          label: 'Approved by me',
          description: 'desc',
          href: '/approvals/history?status=APPROVED',
          count: 2,
          isActive: true,
        },
      ],
      items: [
        {
          id: 'req-1',
          title: 'Request',
          description: 'Desc',
          status: RequestStatus.APPROVED,
          type: RequestType.EQUIPMENT,
          priority: RequestPriority.HIGH,
          requesterId: 'user-1',
          requesterName: 'Alice',
          assigneeId: null,
          assigneeName: null,
          reviewerId: 'admin-1',
          reviewerName: 'Admin',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          submittedAt: '2024-01-01T12:00:00.000Z',
          reviewedAt: '2024-01-01T13:00:00.000Z',
        },
      ],
      isLoading: false,
      isRefetching: false,
      error: null,
    })

    render(
      <ApprovalsHistoryContainer
        status={RequestStatus.APPROVED}
        summary={{ approved: 2, rejected: 0 }}
      />
    )

    expect(mockUseApprovalsHistory).toHaveBeenCalledWith({
      status: RequestStatus.APPROVED,
      summary: { approved: 2, rejected: 0 },
    })
    expect(screen.getByText('Approved by me')).toBeInTheDocument()
    expect(screen.getByText('Request')).toBeInTheDocument()
  })
})
