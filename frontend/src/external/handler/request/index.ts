'use server'

export {
  createRequestAction,
  updateRequestAction,
  submitRequestAction,
  reviewRequestAction,
  approveRequestAction,
  rejectRequestAction,
  cancelRequestAction,
  reopenRequestAction,
  assignRequestAction,
} from './command.action'

export {
  listMyRequestsAction,
  listAssignedRequestsAction,
  listAllRequestsAction,
} from './query.action'

export {
  createRequestServer,
  updateRequestServer,
  submitRequestServer,
  reviewRequestServer,
  approveRequestServer,
  rejectRequestServer,
  cancelRequestServer,
  reopenRequestServer,
  assignRequestServer,
} from './command.server'

export {
  listMyRequestsServer,
  listAssignedRequestsServer,
  listAllRequestsServer,
  getRequestHistoryServer,
} from './query.server'

// Backwards-compatible aliases
export {
  createRequestAction as createRequest,
  updateRequestAction as updateRequest,
  submitRequestAction as submitRequest,
  reviewRequestAction as reviewRequest,
  approveRequestAction as approveRequest,
  rejectRequestAction as rejectRequest,
  cancelRequestAction as cancelRequest,
  reopenRequestAction as reopenRequest,
  assignRequestAction as assignRequest,
} from './command.action'

export {
  listMyRequestsAction as getMyRequests,
  listAssignedRequestsAction as getAssignedRequests,
  listAllRequestsAction as getAllRequests,
} from './query.action'

export type { RequestCommandResponse } from './command.server'
export type {
  RequestListInput,
  RequestListResponse,
  RequestHistoryInput,
  RequestHistoryResponse,
} from './query.server'
