'use server'

import { signUpCommandServer } from '@/external/handler/auth/command.server'

import type {
  SignUpCommandRequest,
  SignUpCommandResponse,
} from '@/external/dto/auth'

export async function signUpAction(
  data: SignUpCommandRequest
): Promise<SignUpCommandResponse> {
  return signUpCommandServer(data)
}
