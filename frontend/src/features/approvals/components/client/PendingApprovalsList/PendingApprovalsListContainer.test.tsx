import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { PendingApprovalsListContainer } from './PendingApprovalsListContainer'

const mockUsePendingApprovals = vi.hoisted(() => vi.fn())

vi.mock('./usePendingApprovals', () => ({
  usePendingApprovals: mockUsePendingApprovals,
}))

vi.mock('@/features/approvals/components/client/PendingApprovalCard', () => ({
  PendingApprovalCard: ({ approval }: { approval: { title: string } }) => (
    <div>{approval.title}</div>
  ),
}))

describe('PendingApprovalsListContainer', () => {
  beforeEach(() => {
    mockUsePendingApprovals.mockReset()
  })

  it('renders pending approvals', () => {
    mockUsePendingApprovals.mockReturnValue({
      approvals: [
        {
          id: 'req-1',
          title: 'Request access',
          status: RequestStatus.SUBMITTED,
          type: RequestType.ACCESS,
          priority: RequestPriority.MEDIUM,
          requesterName: 'Alice',
          submittedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      isLoading: false,
      isRefetching: false,
      errorMessage: undefined,
      successMessage: null,
      handleActionComplete: vi.fn(),
    })

    render(<PendingApprovalsListContainer />)

    expect(mockUsePendingApprovals).toHaveBeenCalled()
    expect(screen.getByText('Request access')).toBeInTheDocument()
  })
})
