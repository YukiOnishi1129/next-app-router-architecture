'use server'

import {
  listAllRequestsServer,
  listAssignedRequestsServer,
  listMyRequestsServer,
} from './query.server'

import type { RequestListInput, RequestListResponse } from './query.server'

export async function listMyRequestsAction(
  params?: RequestListInput
): Promise<RequestListResponse> {
  return listMyRequestsServer(params)
}

export async function listAssignedRequestsAction(
  params?: RequestListInput
): Promise<RequestListResponse> {
  return listAssignedRequestsServer(params)
}

export async function listAllRequestsAction(
  params?: RequestListInput
): Promise<RequestListResponse> {
  return listAllRequestsServer(params)
}

export type { RequestListInput, RequestListResponse } from './query.server'
