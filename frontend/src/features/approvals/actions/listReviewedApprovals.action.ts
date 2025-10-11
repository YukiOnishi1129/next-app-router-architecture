'use server'

import { listReviewedRequestsServer } from '@/external/handler/request/query.server'

import type { RequestStatus } from '@/external/domain/request/request-status'
import type { RequestListResponse } from '@/external/handler/request/query.server'

export async function listReviewedApprovalsAction(
  status?: Extract<RequestStatus, 'APPROVED' | 'REJECTED'>
): Promise<RequestListResponse> {
  return listReviewedRequestsServer({ status })
}
