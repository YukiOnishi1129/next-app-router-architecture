import 'server-only'

import { CREDENTIAL_TYPE } from '@/features/auth/constants/credential'

import {
  loginCommandServer,
  signUpCommandServer,
} from '@/external/handler/auth/command.server'

interface AuthorizeCredentials {
  email?: string
  password?: string
  action?: string
  name?: string
}

const signUpServer = async (credentials: AuthorizeCredentials) => {
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
    return res.user
  } catch (error) {
    throw error
  }
}

const loginServer = async (credentials: AuthorizeCredentials) => {
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
    return res.user
  } catch (error) {
    throw error
  }
}

export async function authorizeServer(credentials: AuthorizeCredentials) {
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
