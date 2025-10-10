import { z } from 'zod'

import type { Account } from '@/features/account/types/account'
import type { Route } from 'next'

const redirectUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith('/') || value.startsWith('http'),
    'Redirect URL must be an absolute URL or an internal path'
  )

export const signInCommandSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: redirectUrlSchema.optional(),
})

export type SignInCommandRequest = z.input<typeof signInCommandSchema>

export type SignInCommandResponse = {
  success: boolean
  error?: string
  account?: Account
  idToken?: string
  refreshToken?: string
  redirectUrl?: Route
}

export const signUpCommandSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  redirectUrl: redirectUrlSchema.optional(),
})

export type SignUpCommandRequest = z.input<typeof signUpCommandSchema>

export type SignUpCommandResponse = {
  success: boolean
  error?: string
  account?: Account
  idToken?: string
  refreshToken?: string
  redirectUrl?: Route
}

export const refreshIdTokenCommandSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshIdTokenCommandRequest = z.input<
  typeof refreshIdTokenCommandSchema
>

export type RefreshIdTokenCommandResponse = {
  success: boolean
  error?: string
  idToken?: string
  refreshToken?: string
  expiresIn?: string
}
