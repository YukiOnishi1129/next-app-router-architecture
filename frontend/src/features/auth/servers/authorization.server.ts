import 'server-only'

import { CREDENTIAL_TYPE } from '@/features/auth/constants/credential'
import {
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
} from '@/features/auth/servers/token.server'

import {
  loginCommandServer,
  signUpCommandServer,
} from '@/external/handler/auth/command.server'

import type { User } from 'next-auth'

interface AuthorizeCredentials {
  email?: string
  password?: string
  action?: string
  name?: string
}

const signUpServer = async (
  credentials: AuthorizeCredentials
): Promise<User> => {
  if (!credentials.email || !credentials.password || !credentials.name) {
    throw new Error('All fields are required for sign-up')
  }
  try {
    const res = await signUpCommandServer({
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    })
    if (!res.success) {
      throw new Error(res.error || 'Sign-up failed')
    }
    if (!res.user) {
      throw new Error('No user data returned')
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
      ...res.user,
      account: {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        roles: res.user.roles,
        status: res.user.status,
        createdAt: res.user.createdAt,
        updatedAt: res.user.updatedAt,
      },
    }
  } catch (error) {
    throw error
  }
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
    })
    if (!res.success) {
      throw new Error(res.error || 'Login failed')
    }
    if (!res.user) {
      throw new Error('No user data returned')
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
      ...res.user,
      account: {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        roles: res.user.roles,
        status: res.user.status,
        createdAt: res.user.createdAt,
        updatedAt: res.user.updatedAt,
      },
    }
  } catch (error) {
    throw error
  }
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
        return await signUpServer(credentials)
      case CREDENTIAL_TYPE.LOGIN:
        return await loginServer(credentials)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    throw error
  }
}
