import 'server-only'

import { cookies } from 'next/headers'

import { ZodError } from 'zod'

import {
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
  deleteAuthCookiesServer,
} from '@/features/auth/servers/token.server'

import { createSessionSchema, createUserSchema } from '@/external/dto/auth'

import {
  authService,
  userManagementService,
  auditService,
  SERVER_CONTEXT,
} from './shared'

import type {
  CreateSessionInput,
  CreateSessionResponse,
  CreateUserInput,
  CreateUserResponse,
  DeleteSessionResponse,
} from '@/external/dto/auth'
import type { Route } from 'next'

export async function createSessionServer(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  try {
    const validated = createSessionSchema.parse(data)

    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    )

    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    })

    await auditService.logUserLogin(user, SERVER_CONTEXT)

    await Promise.all([
      setRefreshTokenCookieServer(authResult.refreshToken),
      setIdTokenCookieServer(authResult.idToken),
    ])

    const redirectUrl = validated.redirectUrl as Route | undefined

    return {
      success: true,
      redirectUrl: redirectUrl || '/dashboard',
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Invalid email or password format',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}

export async function createUserServer(
  data: CreateUserInput
): Promise<CreateUserResponse> {
  try {
    const validated = createUserSchema.parse(data)

    const authResult = await authService.signUpWithEmailPassword(
      validated.email,
      validated.password,
      validated.name
    )

    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name:
        authResult.userInfo.name ||
        validated.name ||
        validated.email.split('@')[0],
      externalId: authResult.userInfo.id,
    })

    await auditService.logUserLogin(user, SERVER_CONTEXT)

    await Promise.all([
      setRefreshTokenCookieServer(authResult.refreshToken),
      setIdTokenCookieServer(authResult.idToken),
    ])

    const redirectUrl = validated.redirectUrl as Route | undefined

    return {
      success: true,
      redirectUrl: redirectUrl || '/dashboard',
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    }
  }
}

export type {
  CreateSessionInput,
  CreateUserInput,
  CreateSessionResponse,
  CreateUserResponse,
  DeleteSessionResponse,
} from '@/external/dto/auth'

export async function deleteSessionServer(
  userId?: string
): Promise<DeleteSessionResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('id-token')?.value

    let user = null

    if (userId) {
      user = await userManagementService.findUserById(userId)
    }

    if (!user && token) {
      const tokenInfo = await authService.verifyToken(token)
      if (tokenInfo?.email) {
        user = await userManagementService.findUserByEmail(tokenInfo.email)
      }
    }

    if (!user) {
      cookieStore.delete('id-token')
      cookieStore.delete('refresh-token')
      return {
        success: false,
        error: 'No active session',
      }
    }

    try {
      await authService.revokeAuthentication()
    } catch (error) {
      console.error('Failed to revoke token:', error)
    }

    await auditService.logUserLogout(user, SERVER_CONTEXT)

    await deleteAuthCookiesServer()

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    }
  }
}
