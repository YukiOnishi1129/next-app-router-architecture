import 'server-only'

import { ZodError } from 'zod'

import { refreshIdTokenCommandSchema } from '@/external/dto/auth'

import { authService } from './shared'

import type {
  RefreshIdTokenCommandRequest,
  RefreshIdTokenCommandResponse,
} from '@/external/dto/auth'

export async function refreshIdTokenCommandServer(
  data: RefreshIdTokenCommandRequest
): Promise<RefreshIdTokenCommandResponse> {
  try {
    const validated = refreshIdTokenCommandSchema.parse(data)
    const refreshed = await authService.refreshToken(validated.refreshToken)

    if (!refreshed?.token) {
      return {
        success: false,
        error: 'Failed to refresh token',
      }
    }

    return {
      success: true,
      idToken: refreshed.token,
      refreshToken: refreshed.refreshToken,
      expiresIn: refreshed.expiresIn,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Invalid refresh token',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token',
    }
  }
}
