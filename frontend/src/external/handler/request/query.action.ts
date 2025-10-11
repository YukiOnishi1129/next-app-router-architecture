'use server'

import {
  getRequestDetailServer,
  getRequestSummaryServer,
  getRequestHistoryServer,
  listPendingApprovalsServer,
  listAllRequestsServer,
  listAssignedRequestsServer,
  listMyRequestsServer,
  listReviewedRequestsServer,
} from './query.server'

import type {
  RequestDetailInput,
  RequestDetailResponse,
  RequestHistoryInput,
  RequestHistoryResponse,
  RequestListInput,
  RequestListResponse,
  PendingApprovalListResponse,
  ReviewerRequestListInput,
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

export async function listPendingApprovalsAction(): Promise<PendingApprovalListResponse> {
  return listPendingApprovalsServer()
}

export async function getRequestHistoryAction(
  params: RequestHistoryInput
): Promise<RequestHistoryResponse> {
  return getRequestHistoryServer(params)
}

export async function listReviewedApprovalsAction(
  params?: ReviewerRequestListInput
): Promise<RequestListResponse> {
  return listReviewedRequestsServer(params)
}
