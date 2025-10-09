'use server'

import {
  createSessionServer,
  deleteSessionServer,
} from '@/external/handler/auth/command.server'

import type {
  CreateSessionInput,
  CreateSessionResponse,
  DeleteSessionResponse,
} from '@/external/dto/auth'

export async function signInAction(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  return createSessionServer(data)
}

export async function signOutAction(
  userId?: string
): Promise<DeleteSessionResponse> {
  return deleteSessionServer(userId)
}
