import 'server-only'

import { ZodError } from 'zod'

import {
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
} from '@/features/auth/servers/token.server'

import { signInCommandSchema, signUpCommandSchema } from '@/external/dto/auth'

import {
  authService,
  accountManagementService,
  auditService,
  SERVER_CONTEXT,
} from './shared'

import type {
  SignUpCommandResponse,
  SignInCommandRequest,
  SignInCommandResponse,
  SignUpCommandRequest,
} from '@/external/dto/auth'
import type { Route } from 'next'

export async function loginCommandServer(
  data: SignInCommandRequest
): Promise<SignInCommandResponse> {
  try {
    const validated = signInCommandSchema.parse(data)

    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    )

    const user = await accountManagementService.getOrCreateAccount({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    })

    await auditService.logAccountLogin(user, SERVER_CONTEXT)

    await Promise.all([
      setRefreshTokenCookieServer(authResult.refreshToken),
      setIdTokenCookieServer(authResult.idToken),
    ])

    const redirectUrl = validated.redirectUrl as Route | undefined

    return {
      success: true,
      account: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        roles: user.getRoles(),
        status: user.getStatus(),
        createdAt: user.getCreatedAt().toISOString(),
        updatedAt: user.getUpdatedAt().toISOString(),
      },
      idToken: authResult.idToken,
      refreshToken: authResult.refreshToken,
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

export async function signUpCommandServer(
  data: SignUpCommandRequest
): Promise<SignUpCommandResponse> {
  try {
    const validated = signUpCommandSchema.parse(data)

    const authResult = await authService.signUpWithEmailPassword(
      validated.email,
      validated.password,
      validated.name
    )

    const user = await accountManagementService.getOrCreateAccount({
      email: authResult.userInfo.email,
      name:
        authResult.userInfo.name ||
        validated.name ||
        validated.email.split('@')[0],
      externalId: authResult.userInfo.id,
    })

    await auditService.logAccountLogin(user, SERVER_CONTEXT)

    await Promise.all([
      setRefreshTokenCookieServer(authResult.refreshToken),
      setIdTokenCookieServer(authResult.idToken),
    ])

    const redirectUrl = validated.redirectUrl as Route | undefined

    return {
      success: true,
      account: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        roles: user.getRoles(),
        status: user.getStatus(),
        createdAt: user.getCreatedAt().toISOString(),
        updatedAt: user.getUpdatedAt().toISOString(),
      },
      idToken: authResult.idToken,
      refreshToken: authResult.refreshToken,
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
