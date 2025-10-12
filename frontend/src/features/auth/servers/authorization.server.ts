import 'server-only'

import { CREDENTIAL_TYPE } from '@/features/auth/constants/credential'
import {
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
} from '@/features/auth/servers/token.server'

import { loginCommandServer } from '@/external/handler/auth/command.server'

import type { User } from 'next-auth'

interface AuthorizeCredentials {
  email?: string
  password?: string
  action?: string
  name?: string
  previousEmail?: string
}

const loginServer = async (
  credentials: AuthorizeCredentials
): Promise<User> => {
  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required for login')
  }

  try {
    const res = await loginCommandServer({
      email: credentials.email,
      password: credentials.password,
      previousEmail: credentials.previousEmail,
    })
    if (!res.success) {
      throw new Error(res.error || 'Login failed')
    }
    if (!res.account) {
      throw new Error('No account data returned')
    }
    if (!res.idToken) {
      throw new Error('No ID token returned')
    }
    if (!res.refreshToken) {
      throw new Error('No refresh token returned')
    }

    await Promise.all([
      await setIdTokenCookieServer(res.idToken),
      await setRefreshTokenCookieServer(res.refreshToken),
    ])
    return {
      ...res.account,
      account: {
        id: res.account.id,
        email: res.account.email,
        name: res.account.name,
        roles: res.account.roles,
        status: res.account.status,
        createdAt: res.account.createdAt,
        updatedAt: res.account.updatedAt,
      },
    }
  } catch (error) {
    throw error
  }
}

const emailChangeLoginServer = async (
  credentials: AuthorizeCredentials
): Promise<User> => {
  if (!credentials.previousEmail) {
    throw new Error('Previous email is required to complete email update login')
  }

  return await loginServer(credentials)
}

export async function authorizeServer(
  credentials: AuthorizeCredentials
): Promise<User | null> {
  if (!credentials.email || !credentials.password || !credentials.action) {
    throw new Error('Missing required fields')
  }

  try {
    switch (credentials.action) {
      case CREDENTIAL_TYPE.SIGNUP:
        throw new Error('Sign-up via credentials is not supported')
      case CREDENTIAL_TYPE.LOGIN:
        return await loginServer(credentials)
      case CREDENTIAL_TYPE.EMAIL_CHANGE_LOGIN:
        return await emailChangeLoginServer(credentials)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    throw error
  }
}
