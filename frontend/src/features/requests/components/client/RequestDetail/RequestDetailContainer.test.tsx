import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { RequestDetailContainer } from './RequestDetailContainer'

const mockUseRequestDetail = vi.hoisted(() => vi.fn())

vi.mock('./useRequestDetail', () => ({
  useRequestDetail: mockUseRequestDetail,
}))

describe('RequestDetailContainer', () => {
  beforeEach(() => {
    mockUseRequestDetail.mockReset()
  })

  const baseState = {
    detail: {
      id: 'req-1',
      title: 'Upgrade laptops',
      description: 'Purchase devices',
      status: RequestStatus.DRAFT,
      type: RequestType.EQUIPMENT,
      priority: RequestPriority.HIGH,
      requesterId: 'user-1',
      requesterName: 'Alice',
      assigneeId: null,
      assigneeName: null,
      reviewerId: null,
      reviewerName: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      submittedAt: null,
      reviewedAt: null,
    },
    isLoading: false,
    isRefetching: false,
    errorMessage: undefined,
    highlightCommentId: undefined,
    canSubmit: true,
    onSubmit: vi.fn(),
    isSubmitting: false,
    submitError: undefined,
    canApprove: false,
    canReject: false,
    canReopen: false,
    onApprove: vi.fn(),
    onReopen: vi.fn(),
    onReopenAndSubmit: vi.fn(),
    isApproving: false,
    isRejecting: false,
    isReopening: false,
    isResubmitting: false,
    approveError: undefined,
    rejectError: undefined,
    reopenError: undefined,
    approveSuccessMessage: null,
    rejectSuccessMessage: null,
    reopenSuccessMessage: null,
    showRejectForm: false,
    rejectReason: '',
    rejectFormError: null,
    onRejectToggle: vi.fn(),
    onRejectReasonChange: vi.fn(),
    onRejectSubmit: vi.fn(),
    onEdit: vi.fn(),
  }

  it('renders request details via presenter', () => {
    mockUseRequestDetail.mockReturnValue(baseState)

    render(<RequestDetailContainer requestId="req-1" />)

    expect(mockUseRequestDetail).toHaveBeenCalledWith({
      requestId: 'req-1',
      highlightCommentId: undefined,
    })
    expect(screen.getByText('Upgrade laptops')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseRequestDetail.mockReturnValue({
      ...baseState,
      detail: null,
      isLoading: true,
    })

    const { container } = render(<RequestDetailContainer requestId="req-1" />)

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  it('renders error message when provided', () => {
    mockUseRequestDetail.mockReturnValue({
      ...baseState,
      detail: null,
      errorMessage: 'Failed to load',
    })

    render(<RequestDetailContainer requestId="req-1" />)

    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })
})
