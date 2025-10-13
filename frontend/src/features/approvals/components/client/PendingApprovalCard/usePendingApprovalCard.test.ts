import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { useApproveRequestMutation } from '@/features/approvals/hooks/mutation/useApproveRequestMutation'
import { useRejectRequestMutation } from '@/features/approvals/hooks/mutation/useRejectRequestMutation'
import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'

import { act, renderHook } from '@/test/test-utils'

import { usePendingApprovalCard } from './usePendingApprovalCard'

vi.useFakeTimers()

vi.mock(
  '@/features/approvals/hooks/mutation/useApproveRequestMutation',
  () => ({
    useApproveRequestMutation: vi.fn(),
  })
)

vi.mock('@/features/approvals/hooks/mutation/useRejectRequestMutation', () => ({
  useRejectRequestMutation: vi.fn(),
}))

const mockedUseApproveMutation = vi.mocked(useApproveRequestMutation)
const mockedUseRejectMutation = vi.mocked(useRejectRequestMutation)

const createMutationMock = <TMutation>(
  overrides: Partial<TMutation> = {}
): TMutation =>
  ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    error: null,
    ...overrides,
  }) as unknown as TMutation

describe('usePendingApprovalCard', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    mockedUseApproveMutation.mockReset()
    mockedUseRejectMutation.mockReset()
  })

  const approval = {
    id: 'req-1',
    title: 'Request',
    status: RequestStatus.SUBMITTED,
    type: RequestType.EQUIPMENT,
    priority: RequestPriority.MEDIUM,
    requesterName: 'Alice',
    submittedAt: '2024-01-01T00:00:00.000Z',
  }

  it('handles approve action and schedules success state', () => {
    const approveMutation =
      createMutationMock<ReturnType<typeof useApproveRequestMutation>>()
    const rejectMutation =
      createMutationMock<ReturnType<typeof useRejectRequestMutation>>()

    mockedUseApproveMutation.mockImplementation(
      (options: Parameters<typeof useApproveRequestMutation>[0]) =>
        ({
          ...approveMutation,
          mutate: vi.fn((variables: { requestId: string }) => {
            options?.onSuccess?.(
              { requestId: variables.requestId },
              variables,
              undefined,
              undefined as never
            )
          }),
        }) as ReturnType<typeof useApproveRequestMutation>
    )
    mockedUseRejectMutation.mockImplementation(
      (options: Parameters<typeof useRejectRequestMutation>[0]) =>
        ({
          ...rejectMutation,
          mutate: vi.fn((variables: { requestId: string; reason: string }) => {
            options?.onSuccess?.(
              { requestId: variables.requestId },
              variables,
              undefined,
              undefined as never
            )
          }),
        }) as ReturnType<typeof useRejectRequestMutation>
    )

    const onActionComplete = vi.fn()

    const { result } = renderHook(() =>
      usePendingApprovalCard({ approval, onActionComplete })
    )

    act(() => {
      result.current.handleApprove()
    })

    expect(onActionComplete).toHaveBeenCalledWith('approve')
    expect(result.current.successState).toBe('approve')

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(result.current.successState).toBeNull()
  })

  it('validates reject reason and triggers mutation', () => {
    const approveMutation =
      createMutationMock<ReturnType<typeof useApproveRequestMutation>>()
    const rejectMutation =
      createMutationMock<ReturnType<typeof useRejectRequestMutation>>()

    mockedUseApproveMutation.mockReturnValue(approveMutation)
    mockedUseRejectMutation.mockImplementation(
      (options: Parameters<typeof useRejectRequestMutation>[0]) =>
        ({
          ...rejectMutation,
          mutate: vi.fn((variables: { requestId: string; reason: string }) => {
            options?.onSuccess?.(
              { requestId: variables.requestId },
              variables,
              undefined,
              undefined as never
            )
          }),
        }) as ReturnType<typeof useRejectRequestMutation>
    )

    const onActionComplete = vi.fn()
    const { result } = renderHook(() =>
      usePendingApprovalCard({ approval, onActionComplete })
    )

    act(() => {
      result.current.handleRejectSubmit()
    })

    expect(result.current.rejectFormError).toBe(
      'Please provide a rejection reason.'
    )

    act(() => {
      result.current.handleRejectReasonChange(' Not a match ')
    })

    act(() => {
      result.current.handleRejectSubmit()
    })

    expect(onActionComplete).toHaveBeenCalledWith('reject')
    expect(result.current.successState).toBe('reject')
  })
})

afterAll(() => {
  vi.useRealTimers()
})
