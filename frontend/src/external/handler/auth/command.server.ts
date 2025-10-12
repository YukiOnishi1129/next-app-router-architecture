import 'server-only'

import { ZodError } from 'zod'

import {
  signInCommandSchema,
  signUpCommandSchema,
  requestPasswordResetCommandSchema,
} from '@/external/dto/auth'

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
  RequestPasswordResetCommandRequest,
  RequestPasswordResetCommandResponse,
} from '@/external/dto/auth'
import type { Route } from 'next'

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')
const EMAIL_VERIFICATION_PATH = '/auth/verify'
const PASSWORD_RESET_COMPLETE_PATH = '/login'

export async function loginCommandServer(
  data: SignInCommandRequest
): Promise<SignInCommandResponse> {
  try {
    const validated = signInCommandSchema.parse(data)

    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    )

    const redirectUrl = validated.redirectUrl as Route | undefined

    if (!authResult.userInfo.emailVerified) {
      const verificationUrl = new URL(EMAIL_VERIFICATION_PATH, APP_BASE_URL)
      if (redirectUrl) {
        verificationUrl.searchParams.set('next', redirectUrl)
      }
      try {
        await authService.sendVerificationEmail(authResult.idToken, {
          verificationContinueUrl: verificationUrl.toString(),
        })
      } catch (error) {
        console.error('Failed to re-send verification email', error)
      }
      return {
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        errorCode: 'EMAIL_NOT_VERIFIED',
        requiresEmailVerification: true,
      }
    }

    const user = await accountManagementService.getOrCreateAccount({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
      previousEmail: validated.previousEmail,
    })

    await auditService.logAccountLogin(user, SERVER_CONTEXT)

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

export async function confirmEmailVerificationServer(oobCode: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await authService.confirmEmailVerification(oobCode)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify email',
    }
  }
}

export async function signUpCommandServer(
  data: SignUpCommandRequest
): Promise<SignUpCommandResponse> {
  try {
    const validated = signUpCommandSchema.parse(data)

    const verificationUrl = new URL(EMAIL_VERIFICATION_PATH, APP_BASE_URL)
    if (validated.redirectUrl) {
      verificationUrl.searchParams.set('next', validated.redirectUrl)
    }

    const authResult = await authService.signUpWithEmailPassword(
      validated.email,
      validated.password,
      validated.name,
      {
        verificationContinueUrl: verificationUrl.toString(),
      }
    )

    const user = await accountManagementService.getOrCreateAccount({
      email: authResult.userInfo.email,
      name:
        authResult.userInfo.name ||
        validated.name ||
        validated.email.split('@')[0],
      externalId: authResult.userInfo.id,
    })

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
      verificationEmailSent: true,
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

export async function requestPasswordResetCommandServer(
  data: RequestPasswordResetCommandRequest
): Promise<RequestPasswordResetCommandResponse> {
  try {
    const validated = requestPasswordResetCommandSchema.parse(data)

    try {
      const resetRedirectUrl = new URL(
        PASSWORD_RESET_COMPLETE_PATH,
        APP_BASE_URL
      )
      resetRedirectUrl.searchParams.set('passwordReset', '1')

      await authService.sendPasswordResetEmail(validated.email, {
        continueUrl: resetRedirectUrl.toString(),
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email'

      if (message.includes('EMAIL_NOT_FOUND')) {
        // Avoid revealing whether the email address exists
        return { success: true }
      }

      return {
        success: false,
        error: message,
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid email format' }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to request password reset',
    }
  }
}
