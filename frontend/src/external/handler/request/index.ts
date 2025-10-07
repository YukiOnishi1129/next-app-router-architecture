"use server";

export {
  createRequestAction,
  updateRequestAction,
  submitRequestAction,
  reviewRequestAction,
  approveRequestAction,
  rejectRequestAction,
  cancelRequestAction,
  assignRequestAction,
} from "./command.action";

export {
  listMyRequestsAction,
  listAssignedRequestsAction,
  listAllRequestsAction,
} from "./query.action";

export {
  createRequestServer,
  updateRequestServer,
  submitRequestServer,
  reviewRequestServer,
  approveRequestServer,
  rejectRequestServer,
  cancelRequestServer,
  assignRequestServer,
} from "./command.server";

export {
  listMyRequestsServer,
  listAssignedRequestsServer,
  listAllRequestsServer,
} from "./query.server";

// Backwards-compatible aliases
export {
  createRequestAction as createRequest,
  updateRequestAction as updateRequest,
  submitRequestAction as submitRequest,
  reviewRequestAction as reviewRequest,
  approveRequestAction as approveRequest,
  rejectRequestAction as rejectRequest,
  cancelRequestAction as cancelRequest,
  assignRequestAction as assignRequest,
} from "./command.action";

export {
  listMyRequestsAction as getMyRequests,
  listAssignedRequestsAction as getAssignedRequests,
  listAllRequestsAction as getAllRequests,
} from "./query.action";

import type { RequestCommandResponse } from "./command.action";
export type { RequestCommandResponse } from "./command.action";
export type { RequestListInput, RequestListResponse } from "./query.action";

export type RequestResponse = RequestCommandResponse;
