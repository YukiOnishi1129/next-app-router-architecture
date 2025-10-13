import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RequestPriority, RequestType } from '@/features/requests/types'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useEditRequestForm } from './useEditRequestForm'

import type { RequestCommandResponse } from '@/external/dto/request/request.command.dto'
import type { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import type { UpdateRequestFormValues } from '@/features/requests/schemas'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import type { FormEvent } from 'react'

const mockUseRequestDetailQuery = vi.hoisted(() => vi.fn())
type RequestDetailQueryResult = ReturnType<typeof useRequestDetailQuery>

type EditMutationResult = UseMutationResult<
  RequestCommandResponse,
  Error,
  UpdateRequestFormValues,
  unknown
>

const createMutationResultMock = (): EditMutationResult =>
  ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    status: 'idle',
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isPaused: false,
    isSuccess: false,
    isLoading: false,
    submittedAt: undefined,
    failureCount: 0,
    failureReason: null,
    variables: undefined,
    context: undefined,
  }) as unknown as EditMutationResult

const mutationRef = vi.hoisted(() => ({
  current: createMutationResultMock(),
}))
const mutationOptionsRef = vi.hoisted(() => ({ current: undefined as unknown }))
const queryClientRef = vi.hoisted(() => ({
  current: undefined as unknown as QueryClient,
}))
const mockUseRouter = vi.hoisted(() => vi.fn())
const routerRef = vi.hoisted(() => ({
  current: {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  },
}))
const mockUpdateRequestAction = vi.hoisted(() => vi.fn())

vi.mock('@/features/requests/hooks/query/useRequestDetailQuery', () => ({
  useRequestDetailQuery: (requestId: string) =>
    mockUseRequestDetailQuery(requestId),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => queryClientRef.current,
  useMutation: (options: unknown) => {
    mutationOptionsRef.current = options
    return mutationRef.current
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}))

vi.mock('@/external/handler/request/command.action', () => ({
  updateRequestAction: (...args: unknown[]) => mockUpdateRequestAction(...args),
}))

describe('useEditRequestForm', () => {
  beforeEach(() => {
    mutationRef.current = createMutationResultMock()
    mutationOptionsRef.current = undefined
    queryClientRef.current = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as QueryClient
    routerRef.current = {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
    }
    mockUseRouter.mockReturnValue(routerRef.current)
    mockUseRequestDetailQuery.mockReset()
    mockUpdateRequestAction.mockReset()
  })

  const request = {
    id: 'req-1',
    title: 'Original title',
    description: 'Original description',
    type: RequestType.ACCESS,
    priority: RequestPriority.HIGH,
    assigneeId: 'assignee-1',
  }

  const requestQueryResult = {
    data: request,
    isLoading: false,
    error: null,
  } as unknown as RequestDetailQueryResult

  it('initializes form with request data', async () => {
    mockUseRequestDetailQuery.mockReturnValue(requestQueryResult)

    const { result } = renderHook(() => useEditRequestForm(request.id))

    await waitFor(() =>
      expect(result.current.form.getValues()).toMatchObject({
        requestId: request.id,
        title: request.title,
        description: request.description,
        type: request.type,
        priority: request.priority,
        assigneeId: request.assigneeId,
      })
    )

    expect(result.current.isLoading).toBe(false)
  })

  it('submits edited values through the mutation', async () => {
    mockUseRequestDetailQuery.mockReturnValue(requestQueryResult)
    const mutateAsync = vi.fn().mockResolvedValue({
      success: true,
      request,
    })
    mutationRef.current = {
      ...mutationRef.current,
      mutateAsync,
    } as EditMutationResult

    const { result } = renderHook(() => useEditRequestForm(request.id))

    await act(async () => {
      result.current.form.setValue('title', 'Updated title')
      result.current.form.setValue('description', 'Updated description')
      result.current.form.setValue('type', RequestType.EQUIPMENT)
      result.current.form.setValue('priority', RequestPriority.MEDIUM)
      result.current.form.setValue('assigneeId', 'new-assignee')
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => undefined,
      } as unknown as FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        requestId: request.id,
        title: 'Updated title',
        description: 'Updated description',
        type: RequestType.EQUIPMENT,
        priority: RequestPriority.MEDIUM,
        assigneeId: 'new-assignee',
      })
    )
  })

  it('handles successful mutation by clearing errors, invalidating queries, and navigating', async () => {
    mockUseRequestDetailQuery.mockReturnValue(requestQueryResult)

    const { result } = renderHook(() => useEditRequestForm(request.id))

    const mutationOptions = mutationOptionsRef.current as {
      onSuccess: (
        data: { success: boolean; error?: string | null; request?: unknown },
        variables: { requestId: string },
        context: unknown,
        mutation: unknown
      ) => Promise<void>
    }

    await act(async () => {
      await mutationOptions.onSuccess(
        { success: true, request },
        { requestId: request.id },
        undefined,
        mutationRef.current
      )
    })

    expect(queryClientRef.current.invalidateQueries).toHaveBeenCalledTimes(3)
    expect(routerRef.current.push).toHaveBeenCalledWith(
      `/requests/${request.id}`
    )
    expect(result.current.serverError).toBeNull()
  })

  it('stores server error when mutation result fails', async () => {
    mockUseRequestDetailQuery.mockReturnValue(requestQueryResult)

    const { result } = renderHook(() => useEditRequestForm(request.id))

    const mutationOptions = mutationOptionsRef.current as {
      onSuccess: (
        data: { success: boolean; error?: string | null },
        variables: { requestId: string },
        context: unknown,
        mutation: unknown
      ) => Promise<void>
    }

    await act(async () => {
      await mutationOptions.onSuccess(
        { success: false, error: 'Failed to update' },
        { requestId: request.id },
        undefined,
        mutationRef.current
      )
    })

    expect(result.current.serverError).toBe('Failed to update')
    expect(routerRef.current.push).not.toHaveBeenCalled()
  })

  it('sets generic error message when mutation throws', async () => {
    mockUseRequestDetailQuery.mockReturnValue(requestQueryResult)

    const { result } = renderHook(() => useEditRequestForm(request.id))

    const mutationOptions = mutationOptionsRef.current as {
      onError: (
        error: unknown,
        variables: unknown,
        context: unknown,
        mutation: unknown
      ) => Promise<void>
    }

    await act(async () => {
      await mutationOptions.onError(
        new Error('Network error'),
        undefined,
        undefined,
        mutationRef.current
      )
    })

    expect(result.current.serverError).toBe('Failed to update request')
  })
})
