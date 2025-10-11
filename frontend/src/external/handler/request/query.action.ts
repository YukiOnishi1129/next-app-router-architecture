'use server'

import {
  getRequestDetailServer,
  getRequestSummaryServer,
  listAllRequestsServer,
  listAssignedRequestsServer,
  listMyRequestsServer,
} from './query.server'

import type {
  RequestDetailInput,
  RequestDetailResponse,
  RequestListInput,
  RequestListResponse,
  RequestSummaryResponse,
} from './query.server'

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

export async function getRequestDetailAction(
  params: RequestDetailInput
): Promise<RequestDetailResponse> {
  return getRequestDetailServer(params)
}

export async function getRequestSummaryAction(): Promise<RequestSummaryResponse> {
  return getRequestSummaryServer()
}

export type {
  RequestDetailInput,
  RequestDetailResponse,
  RequestListInput,
  RequestListResponse,
  RequestSummaryResponse,
} from './query.server'
