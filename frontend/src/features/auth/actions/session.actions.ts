'use server'

import { deleteSessionServer } from '@/external/handler/auth/command.server'

import type { DeleteSessionResponse } from '@/external/dto/auth'

export async function signOutAction(
  userId?: string
): Promise<DeleteSessionResponse> {
  return deleteSessionServer(userId)
}
