import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useReopenRequestMutation } from '@/features/requests/hooks/mutation/useReopenRequestMutation'
import { useSubmitRequestMutation } from '@/features/requests/hooks/mutation/useSubmitRequestMutation'
import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import {
  RequestStatus,
  RequestType,
  RequestPriority,
} from '@/features/requests/types'

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

type MutationMock<TVariables = unknown, TData = unknown> = {
  mutate: ReturnType<typeof vi.fn>
  mutateAsync: ReturnType<typeof vi.fn>
  reset: ReturnType<typeof vi.fn>
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  isIdle: boolean
  data: TData | undefined
  error: Error | null
  variables: TVariables | undefined
  context: unknown
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
  }

  const createMutationMock = <TVariables = unknown, TData = unknown>(
    overrides: Partial<MutationMock<TVariables, TData>> = {}
  ): MutationMock<TVariables, TData> => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    isIdle: false,
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    ...overrides,
  })

  it('allows requester to submit draft requests', async () => {
    const submitMutation = createMutationMock()
    mockedUseSubmitMutation.mockReturnValue(
      submitMutation as unknown as ReturnType<typeof useSubmitRequestMutation>
    )
    mockedUseApproveMutation.mockReturnValue(
      createMutationMock() as unknown as ReturnType<
        typeof useApproveRequestMutation
      >
    )
    mockedUseRejectMutation.mockReturnValue(
      createMutationMock() as unknown as ReturnType<
        typeof useRejectRequestMutation
      >
    )
    mockedUseReopenMutation.mockReturnValue(
      createMutationMock() as unknown as ReturnType<
        typeof useReopenRequestMutation
      >
    )
    mockedUseRequestDetailQuery.mockReturnValue({
      data: baseRequest,
      isPending: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useRequestDetailQuery>)
    mockedUseAuthSession.mockReturnValue({
      session: {
        account: {
          id: 'user-1',
          name: 'Alice',
          email: 'alice@example.com',
          roles: ['MEMBER'],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
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
    mockedUseSubmitMutation.mockReturnValue(
      submitMutation as unknown as ReturnType<typeof useSubmitRequestMutation>
    )
    mockedUseApproveMutation.mockReturnValue(
      approveMutation as unknown as ReturnType<typeof useApproveRequestMutation>
    )
    mockedUseRejectMutation.mockReturnValue(
      createMutationMock() as unknown as ReturnType<
        typeof useRejectRequestMutation
      >
    )
    mockedUseReopenMutation.mockReturnValue(
      createMutationMock() as unknown as ReturnType<
        typeof useReopenRequestMutation
      >
    )

    mockedUseRequestDetailQuery.mockReturnValue({
      data: {
        ...baseRequest,
        status: RequestStatus.SUBMITTED,
        requesterId: 'user-2',
      },
      isPending: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useRequestDetailQuery>)
    mockedUseAuthSession.mockReturnValue({
      session: {
        account: {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@example.com',
          roles: ['ADMIN'],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
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
