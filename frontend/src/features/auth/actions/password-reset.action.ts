'use server'

import { requestPasswordResetCommandServer } from '@/external/handler/auth/command.server'

import type {
  RequestPasswordResetCommandRequest,
  RequestPasswordResetCommandResponse,
} from '@/external/dto/auth'

export async function requestPasswordResetAction(
  data: RequestPasswordResetCommandRequest
): Promise<RequestPasswordResetCommandResponse> {
  return requestPasswordResetCommandServer(data)
}
