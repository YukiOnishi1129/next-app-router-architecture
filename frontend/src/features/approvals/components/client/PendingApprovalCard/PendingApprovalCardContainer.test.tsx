import { describe, expect, it, vi } from 'vitest'

import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { PendingApprovalCardContainer } from './PendingApprovalCardContainer'

const mockUsePendingApprovalCard = vi.hoisted(() => vi.fn())

vi.mock('./usePendingApprovalCard', () => ({
  usePendingApprovalCard: mockUsePendingApprovalCard,
}))

describe('PendingApprovalCardContainer', () => {
  it('renders presenter with approval data', () => {
    mockUsePendingApprovalCard.mockReturnValue({
      showRejectForm: false,
      rejectReason: '',
      rejectFormError: null,
      isApproving: false,
      isRejecting: false,
      errorMessage: null,
      successState: null,
      handleApprove: vi.fn(),
      handleToggleReject: vi.fn(),
      handleRejectReasonChange: vi.fn(),
      handleRejectSubmit: vi.fn(),
    })

    render(
      <PendingApprovalCardContainer
        approval={{
          id: 'req-1',
          title: 'Approve me',
          status: RequestStatus.SUBMITTED,
          type: RequestType.EQUIPMENT,
          priority: RequestPriority.HIGH,
          requesterName: 'Alice',
          submittedAt: '2024-01-01T00:00:00.000Z',
        }}
        onActionComplete={vi.fn()}
      />
    )

    expect(mockUsePendingApprovalCard).toHaveBeenCalled()
    expect(screen.getByText('Approve me')).toBeInTheDocument()
  })
})
