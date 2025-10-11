'use server'

import { listReviewedRequestsServer } from '@/external/handler/request/query.server'

import type { RequestListResponse } from '@/external/handler/request/query.server'
import type { RequestStatus } from '@/features/requests/types'

export async function listReviewedApprovalsAction(
  status?: Extract<RequestStatus, 'APPROVED' | 'REJECTED'>
): Promise<RequestListResponse> {
  return listReviewedRequestsServer({ status })
}
