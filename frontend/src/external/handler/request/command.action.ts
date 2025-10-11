'use server'

import {
  assignRequestServer,
  approveRequestServer,
  cancelRequestServer,
  createRequestServer,
  reopenRequestServer,
  rejectRequestServer,
  reviewRequestServer,
  submitRequestServer,
  updateRequestServer,
} from './command.server'

import type {
  AssignRequestInput,
  RequestCommandResponse,
  ApproveRequestInput,
  CancelRequestInput,
  CreateRequestInput,
  ReopenRequestInput,
  RejectRequestInput,
  ReviewRequestInput,
  SubmitRequestInput,
  UpdateRequestInput,
} from './command.server'

export async function createRequestAction(
  data: CreateRequestInput
): Promise<RequestCommandResponse> {
  return createRequestServer(data)
}

export async function updateRequestAction(
  data: UpdateRequestInput
): Promise<RequestCommandResponse> {
  return updateRequestServer(data)
}

export async function submitRequestAction(
  data: SubmitRequestInput
): Promise<RequestCommandResponse> {
  return submitRequestServer(data)
}

export async function reviewRequestAction(
  data: ReviewRequestInput
): Promise<RequestCommandResponse> {
  return reviewRequestServer(data)
}

export async function approveRequestAction(
  data: ApproveRequestInput
): Promise<RequestCommandResponse> {
  return approveRequestServer(data)
}

export async function rejectRequestAction(
  data: RejectRequestInput
): Promise<RequestCommandResponse> {
  return rejectRequestServer(data)
}

export async function cancelRequestAction(
  data: CancelRequestInput
): Promise<RequestCommandResponse> {
  return cancelRequestServer(data)
}

export async function reopenRequestAction(
  data: ReopenRequestInput
): Promise<RequestCommandResponse> {
  return reopenRequestServer(data)
}

export async function assignRequestAction(
  data: AssignRequestInput
): Promise<RequestCommandResponse> {
  return assignRequestServer(data)
}

export type { RequestCommandResponse } from './command.server'
export type {
  CreateRequestInput,
  UpdateRequestInput,
  SubmitRequestInput,
  ReviewRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
  CancelRequestInput,
  ReopenRequestInput,
  AssignRequestInput,
} from './command.server'
