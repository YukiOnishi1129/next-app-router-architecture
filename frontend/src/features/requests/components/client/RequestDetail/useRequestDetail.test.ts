import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useReopenRequestMutation } from '@/features/requests/hooks/mutation/useReopenRequestMutation'
import { useSubmitRequestMutation } from '@/features/requests/hooks/mutation/useSubmitRequestMutation'
import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import { RequestStatus, RequestType, RequestPriority } from '@/features/requests/types'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useRequestDetail } from './useRequestDetail'

vi.mock('@/features/requests/hooks/query/useRequestDetailQuery', () => ({
  useRequestDetailQuery: vi.fn(),
}))
vi.mock('@/features/auth/hooks/useAuthSession', () => ({
  useAuthSession: vi.fn(),
}))
vi.mock('@/features/requests/hooks/mutation/useSubmitRequestMutation', () => ({
  useSubmitRequestMutation: vi.fn(),
}))
vi.mock(
  '@/features/approvals/hooks/mutation/useApproveRequestMutation',
  () => ({
    useApproveRequestMutation: vi.fn(),
  })
)
vi.mock('@/features/approvals/hooks/mutation/useRejectRequestMutation', () => ({
  useRejectRequestMutation: vi.fn(),
}))
vi.mock('@/features/requests/hooks/mutation/useReopenRequestMutation', () => ({
  useReopenRequestMutation: vi.fn(),
}))

const mockedUseRequestDetailQuery = vi.mocked(useRequestDetailQuery)
const mockedUseAuthSession = vi.mocked(useAuthSession)
const mockedUseSubmitMutation = vi.mocked(useSubmitRequestMutation)
const mockedUseApproveMutation = vi.mocked(useApproveRequestMutation)
const mockedUseRejectMutation = vi.mocked(useRejectRequestMutation)
const mockedUseReopenMutation = vi.mocked(useReopenRequestMutation)

type MutationMock = {
  mutate: ReturnType<typeof vi.fn>
  mutateAsync: ReturnType<typeof vi.fn>
  reset: ReturnType<typeof vi.fn>
  isPending: boolean
  isSuccess: boolean
  error: unknown
}

describe('useRequestDetail', () => {
  beforeEach(() => {
    mockedUseRequestDetailQuery.mockReset()
    mockedUseAuthSession.mockReset()
    mockedUseSubmitMutation.mockReset()
    mockedUseApproveMutation.mockReset()
    mockedUseRejectMutation.mockReset()
    mockedUseReopenMutation.mockReset()
  })

  const baseRequest = {
    id: 'req-1',
    title: 'Upgrade laptops',
    description: 'Purchase new devices',
    status: RequestStatus.DRAFT,
    type: RequestType.EQUIPMENT,
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
  }

  const createMutationMock = (
    overrides: Partial<MutationMock> = {}
  ): MutationMock => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isSuccess: false,
    error: null,
    ...overrides,
  })

  it('allows requester to submit draft requests', async () => {
    const submitMutation = createMutationMock()
    mockedUseSubmitMutation.mockReturnValue(submitMutation)
    mockedUseApproveMutation.mockReturnValue(createMutationMock())
    mockedUseRejectMutation.mockReturnValue(createMutationMock())
    mockedUseReopenMutation.mockReturnValue(createMutationMock())
    mockedUseRequestDetailQuery.mockReturnValue({
      data: baseRequest,
      isPending: false,
      isFetching: false,
      error: undefined,
    })
    mockedUseAuthSession.mockReturnValue({
      session: {
        account: {
          id: 'user-1',
          roles: ['MEMBER'],
        },
      },
      status: 'authenticated',
      isAuthenticated: true,
      isLoading: false,
      update: vi.fn(),
    })

    const { result } = renderHook(() =>
      useRequestDetail({ requestId: 'req-1', highlightCommentId: null })
    )

    await waitFor(() => expect(result.current.canSubmit).toBe(true))
    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.onSubmit()
    })

    expect(submitMutation.reset).toHaveBeenCalled()
    expect(submitMutation.mutate).toHaveBeenCalledTimes(1)
  })

  it('enables approval workflow for admins and triggers approve mutation', async () => {
    const submitMutation = createMutationMock()
    const approveMutation = createMutationMock()
    mockedUseSubmitMutation.mockReturnValue(submitMutation)
    mockedUseApproveMutation.mockReturnValue(approveMutation)
    mockedUseRejectMutation.mockReturnValue(createMutationMock())
    mockedUseReopenMutation.mockReturnValue(createMutationMock())

    mockedUseRequestDetailQuery.mockReturnValue({
      data: {
        ...baseRequest,
        status: RequestStatus.SUBMITTED,
        requesterId: 'user-2',
      },
      isPending: false,
      isFetching: false,
      error: undefined,
    })
    mockedUseAuthSession.mockReturnValue({
      session: {
        account: {
          id: 'admin-1',
          roles: ['ADMIN'],
        },
      },
      status: 'authenticated',
      isAuthenticated: true,
      isLoading: false,
      update: vi.fn(),
    })

    const { result } = renderHook(() =>
      useRequestDetail({ requestId: 'req-1', highlightCommentId: null })
    )

    await waitFor(() => expect(result.current.canApprove).toBe(true))
    expect(result.current.canReject).toBe(true)
    expect(result.current.canReopen).toBe(false)

    act(() => {
      result.current.onApprove()
    })

    expect(approveMutation.reset).toHaveBeenCalled()
    expect(approveMutation.mutate).toHaveBeenCalledWith({ requestId: 'req-1' })
  })
})
