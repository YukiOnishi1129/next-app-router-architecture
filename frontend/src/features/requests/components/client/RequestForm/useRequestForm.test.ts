import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session } from 'next-auth'

import { useAccountListQuery } from '@/features/account/hooks/query/useAccountListQuery'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/features/requests/types'
import type { RequestDto } from '@/external/dto/request/request.dto'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { createRequestAction } from '@/external/handler/request/command.action'

import { useRequestForm } from './useRequestForm'

vi.mock('@/features/auth/hooks/useAuthSession', () => ({
  useAuthSession: vi.fn(),
}))

vi.mock('@/features/account/hooks/query/useAccountListQuery', () => ({
  useAccountListQuery: vi.fn(),
}))

vi.mock('@/external/handler/request/command.action', () => ({
  createRequestAction: vi.fn(),
}))

const mockedUseAuthSession = vi.mocked(useAuthSession)
const mockedUseAccountListQuery = vi.mocked(useAccountListQuery)
const mockedCreateRequestAction = vi.mocked(createRequestAction)

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}

vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation')
  return {
    ...actual,
    useRouter: () => routerMock,
  }
})

const session: Session = {
  account: {
    id: 'user-1',
    name: 'Owner',
    email: 'owner@example.com',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  expires: new Date(Date.now() + 60_000).toISOString(),
}

type AuthSession = ReturnType<typeof useAuthSession>

const updateSessionMock = vi.fn() as AuthSession['update']

const sessionMock: AuthSession = {
  session,
  status: 'authenticated',
  isAuthenticated: true,
  isLoading: false,
  update: updateSessionMock,
}

describe('useRequestForm', () => {
  beforeEach(() => {
    mockedCreateRequestAction.mockReset()
    mockedUseAccountListQuery.mockReset()
    mockedUseAuthSession.mockReset()
    routerMock.push.mockReset()
    routerMock.replace.mockReset()
    routerMock.refresh.mockReset()
  })

  it('submits a request and navigates on success', async () => {
    mockedUseAuthSession.mockReturnValue(sessionMock)
    mockedUseAccountListQuery.mockReturnValue({
      data: {
        success: true,
        accounts: [
          {
            id: 'assignee-1',
            name: 'Assignee',
            email: 'assignee@example.com',
            status: 'ACTIVE',
            roles: ['MEMBER'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      },
      isLoading: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useAccountListQuery>)

    const requestMock: RequestDto = {
      id: 'req-123',
      title: 'My request',
      description: 'Need new laptops',
      type: RequestType.ACCESS,
      priority: RequestPriority.URGENT,
      status: RequestStatus.DRAFT,
      requesterId: session.account.id,
      requesterName: session.account.name,
      assigneeId: '00000000-0000-0000-0000-000000000000',
      assigneeName: 'Assignee',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: null,
      reviewedAt: null,
      reviewerId: null,
      reviewerName: null,
    }

    mockedCreateRequestAction.mockResolvedValueOnce({
      success: true,
      request: requestMock,
    })

    const { result } = renderHook(() => useRequestForm())

    await act(async () => {
      result.current.form.setValue('title', ' My request ')
      result.current.form.setValue('description', ' Need new laptops ')
      result.current.form.setValue('type', RequestType.ACCESS)
      result.current.form.setValue('priority', RequestPriority.URGENT)
      result.current.form.setValue(
        'assigneeId',
        '00000000-0000-0000-0000-000000000000'
      )
      await result.current.handleSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(mockedCreateRequestAction).toHaveBeenCalledWith({
        title: 'My request',
        description: 'Need new laptops',
        type: RequestType.ACCESS,
        priority: RequestPriority.URGENT,
        assigneeId: '00000000-0000-0000-0000-000000000000',
      })
    )

    await waitFor(() =>
      expect(routerMock.push).toHaveBeenCalledWith('/requests/req-123')
    )
    expect(result.current.serverError).toBeNull()
  })

  it('sets server error when submission fails', async () => {
    mockedUseAuthSession.mockReturnValue(sessionMock)
    mockedUseAccountListQuery.mockReturnValue({
      data: {
        success: true,
        accounts: [],
        total: 0,
        limit: 100,
        offset: 0,
      },
      isLoading: false,
      isFetching: false,
      error: null,
    } as unknown as ReturnType<typeof useAccountListQuery>)

    mockedCreateRequestAction.mockResolvedValueOnce({
      success: false,
      error: 'Unable to create request',
    })

    const { result } = renderHook(() => useRequestForm())

    await act(async () => {
      result.current.form.setValue('title', 'Failing request')
      result.current.form.setValue('description', 'Break things')
      await result.current.handleSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Unable to create request')
    )
    expect(routerMock.push).not.toHaveBeenCalled()
  })
})
