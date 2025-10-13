'use server'

import {
  confirmEmailVerificationServer,
  requestPasswordResetCommandServer,
  signUpCommandServer,
} from './command.server'

import type {
  RequestPasswordResetCommandRequest,
  RequestPasswordResetCommandResponse,
  SignUpCommandRequest,
  SignUpCommandResponse,
} from '@/external/dto/auth'

export async function signUpCommandAction(
  data: SignUpCommandRequest
): Promise<SignUpCommandResponse> {
  return signUpCommandServer(data)
}

export async function requestPasswordResetCommandAction(
  data: RequestPasswordResetCommandRequest
): Promise<RequestPasswordResetCommandResponse> {
  return requestPasswordResetCommandServer(data)
}

export async function confirmEmailVerificationAction(oobCode: string) {
  return confirmEmailVerificationServer(oobCode)
}
