'use server'

import {
  createSessionServer,
  createUserServer,
  deleteSessionServer,
} from '@/external/handler/auth/command.server'

import type {
  CreateSessionInput,
  CreateSessionResponse,
  CreateUserInput,
  CreateUserResponse,
  DeleteSessionResponse,
} from '@/external/dto/auth'

export async function signInAction(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  return createSessionServer(data)
}

export async function signUpAction(
  data: CreateUserInput
): Promise<CreateUserResponse> {
  return createUserServer(data)
}

export async function signOutAction(
  userId?: string
): Promise<DeleteSessionResponse> {
  return deleteSessionServer(userId)
}
