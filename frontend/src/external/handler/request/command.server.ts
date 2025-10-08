import 'server-only'

import { ZodError } from 'zod'

import {
  createRequestSchema,
  updateRequestSchema,
  submitRequestSchema,
  reviewRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  cancelRequestSchema,
  assignRequestSchema,
} from '@/external/dto/request'

import {
  workflowService,
  approvalService,
  userManagementService,
  mapRequestToDto,
} from './shared'
import { getSessionServer } from '../auth/query.server'

import type {
  CreateRequestInput,
  UpdateRequestInput,
  SubmitRequestInput,
  ReviewRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
  CancelRequestInput,
  AssignRequestInput,
  RequestCommandResponse,
} from '@/external/dto/request'

async function requireSessionUser() {
  const session = await getSessionServer()
  if (!session.isAuthenticated || !session.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function createRequestServer(
  data: CreateRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = createRequestSchema.parse(data)

    const user = await userManagementService.findUserById(currentUser.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const request = await workflowService.createRequest(user, {
      title: validated.title,
      description: validated.description,
      type: validated.type,
      priority: validated.priority,
      assigneeId: validated.assigneeId,
    })

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create request',
    }
  }
}

export async function updateRequestServer(
  data: UpdateRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = updateRequestSchema.parse(data)

    const user = await userManagementService.findUserById(currentUser.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const request = await workflowService.updateRequest(
      validated.requestId,
      user,
      {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        priority: validated.priority,
      }
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update request',
    }
  }
}

export async function submitRequestServer(
  data: SubmitRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = submitRequestSchema.parse(data)

    const user = await userManagementService.findUserById(currentUser.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const request = await workflowService.submitRequest(
      validated.requestId,
      user
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to submit request',
    }
  }
}

export async function reviewRequestServer(
  data: ReviewRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = reviewRequestSchema.parse(data)

    const reviewer = await userManagementService.findUserById(currentUser.id)
    if (!reviewer) {
      return { success: false, error: 'User not found' }
    }

    const request = await approvalService.startReview(
      validated.requestId,
      reviewer
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start review',
    }
  }
}

export async function approveRequestServer(
  data: ApproveRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = approveRequestSchema.parse(data)

    const approver = await userManagementService.findUserById(currentUser.id)
    if (!approver) {
      return { success: false, error: 'User not found' }
    }

    const request = await approvalService.approveRequest(
      validated.requestId,
      approver,
      validated.comments
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to approve request',
    }
  }
}

export async function rejectRequestServer(
  data: RejectRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = rejectRequestSchema.parse(data)

    const reviewer = await userManagementService.findUserById(currentUser.id)
    if (!reviewer) {
      return { success: false, error: 'User not found' }
    }

    const request = await approvalService.rejectRequest(
      validated.requestId,
      reviewer,
      validated.reason
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reject request',
    }
  }
}

export async function cancelRequestServer(
  data: CancelRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = cancelRequestSchema.parse(data)

    const user = await userManagementService.findUserById(currentUser.id)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const request = await workflowService.cancelRequest(
      validated.requestId,
      user,
      validated.reason || 'Cancelled by user'
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to cancel request',
    }
  }
}

export async function assignRequestServer(
  data: AssignRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser()
    const validated = assignRequestSchema.parse(data)

    const actor = await userManagementService.findUserById(currentUser.id)
    if (!actor) {
      return { success: false, error: 'User not found' }
    }

    const request = await workflowService.assignRequest(
      validated.requestId,
      actor,
      validated.assigneeId
    )

    return {
      success: true,
      request: mapRequestToDto(request),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to assign request',
    }
  }
}

export type {
  CreateRequestInput,
  UpdateRequestInput,
  SubmitRequestInput,
  ReviewRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
  CancelRequestInput,
  AssignRequestInput,
  RequestCommandResponse,
} from '@/external/dto/request'
