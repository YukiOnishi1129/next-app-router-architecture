import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'

import { UserId } from '@/external/domain'
import { requestListSchema } from '@/external/dto/request'

import {
  requestRepository,
  userManagementService,
  mapRequestToDto,
} from './shared'

import type {
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'

async function requireSessionUser() {
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
    const currentUser = await requireSessionUser()
    const validated = requestListSchema.parse(params ?? {})

    const requesterId = UserId.create(currentUser.id)
    const requests = await requestRepository.findByRequesterId(
      requesterId,
      validated.limit,
      validated.offset
    )

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
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
    const currentUser = await requireSessionUser()
    const validated = requestListSchema.parse(params ?? {})

    const assigneeId = UserId.create(currentUser.id)
    const requests = await requestRepository.findByAssigneeId(
      assigneeId,
      validated.limit,
      validated.offset
    )

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
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
    const currentUser = await requireSessionUser()
    const validated = requestListSchema.parse(params ?? {})

    const user = await userManagementService.findUserById(currentUser.id)
    if (!user || !user.isAdmin()) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const requests = await requestRepository.findAll(
      validated.limit,
      validated.offset
    )

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
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

export type {
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'
