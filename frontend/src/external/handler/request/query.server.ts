import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'

import { AccountId, RequestId } from '@/external/domain'
import { requestDetailSchema, requestListSchema } from '@/external/dto/request'

import {
  requestRepository,
  accountManagementService,
  mapRequestToDto,
  approvalService,
} from './shared'

import type {
  PendingApprovalListResponse,
  RequestDetailInput,
  RequestDetailResponse,
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'

async function requireSessionAccount() {
  const session = await getSessionServer()
  if (!session?.account) {
    throw new Error('Unauthorized')
  }
  return session.account
}

export async function listMyRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentAccount = await requireSessionAccount()
    const validated = requestListSchema.parse(params ?? {})

    const requesterId = AccountId.create(currentAccount.id)
    const requests = await requestRepository.findByRequesterId(
      requesterId,
      validated.limit,
      validated.offset
    )

    const requester = await accountManagementService.findAccountById(
      currentAccount.id
    )

    return {
      success: true,
      requests: requests.map((request) =>
        mapRequestToDto(request, {
          requesterName: requester?.getName() ?? null,
        })
      ),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list requests',
    }
  }
}

export async function listAssignedRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentAccount = await requireSessionAccount()
    const validated = requestListSchema.parse(params ?? {})

    const assigneeId = AccountId.create(currentAccount.id)
    const requests = await requestRepository.findByAssigneeId(
      assigneeId,
      validated.limit,
      validated.offset
    )

    const assigneeAccount = await accountManagementService.findAccountById(
      currentAccount.id
    )

    return {
      success: true,
      requests: requests.map((request) =>
        mapRequestToDto(request, {
          requesterName: null,
          assigneeName: assigneeAccount?.getName() ?? null,
        })
      ),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to list assigned requests',
    }
  }
}

export async function listAllRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentAccount = await requireSessionAccount()
    const validated = requestListSchema.parse(params ?? {})

    const user = await accountManagementService.findAccountById(
      currentAccount.id
    )
    if (!user || !user.isAdmin()) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const requests = await requestRepository.findAll(
      validated.limit,
      validated.offset
    )

    return {
      success: true,
      requests: requests.map((request) =>
        mapRequestToDto(request, {
          requesterName: null,
        })
      ),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list requests',
    }
  }
}

export async function getRequestDetailServer(
  params: RequestDetailInput
): Promise<RequestDetailResponse> {
  try {
    const currentAccount = await requireSessionAccount()
    const validated = requestDetailSchema.parse(params)

    const account = await accountManagementService.findAccountById(
      currentAccount.id
    )
    if (!account) {
      return { success: false, error: 'Account not found' }
    }

    const request = await requestRepository.findById(
      RequestId.create(validated.requestId)
    )

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    const isRequester = request
      .getRequesterId()
      .equals(AccountId.create(currentAccount.id))
    const assigneeId = request.getAssigneeId()
    const isAssignee =
      assigneeId?.equals(AccountId.create(currentAccount.id)) ?? false
    const isAdmin = account.isAdmin()

    if (!isRequester && !isAssignee && !isAdmin) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const requesterAccount = await accountManagementService.findAccountById(
      request.getRequesterId().getValue()
    )

    const assigneeIdValue = request.getAssigneeId()?.getValue()
    const assigneeAccount = assigneeIdValue
      ? await accountManagementService.findAccountById(assigneeIdValue)
      : null

    const reviewerIdValue = request.getReviewerId()?.getValue()
    const reviewerAccount = reviewerIdValue
      ? await accountManagementService.findAccountById(reviewerIdValue)
      : null

    return {
      success: true,
      request: mapRequestToDto(request, {
        requesterName: requesterAccount?.getName() ?? null,
        assigneeName: assigneeAccount?.getName() ?? null,
        reviewerName: reviewerAccount?.getName() ?? null,
      }),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load request detail',
    }
  }
}

export type {
  RequestDetailInput,
  RequestDetailResponse,
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'

export async function listPendingApprovalsServer(): Promise<PendingApprovalListResponse> {
  try {
    const currentAccount = await requireSessionAccount()

    const approvals = await approvalService.getPendingApprovals(
      currentAccount.id
    )

    const requests = await Promise.all(
      approvals.map(async (request) => {
        const requesterAccount = await accountManagementService.findAccountById(
          request.getRequesterId().getValue()
        )

        return {
          id: request.getId().getValue(),
          title: request.getTitle(),
          status: request.getStatus(),
          type: request.getType(),
          priority: request.getPriority(),
          requesterName: requesterAccount?.getName() ?? null,
          submittedAt: request.getSubmittedAt()
            ? request.getSubmittedAt()!.toISOString()
            : null,
        }
      })
    )

    return { success: true, requests }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load pending approvals',
    }
  }
}
