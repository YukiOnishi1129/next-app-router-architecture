'use server'

import { listPendingApprovalsServer } from '@/external/handler/request/query.server'

export async function listPendingApprovalsAction() {
  return listPendingApprovalsServer()
}
