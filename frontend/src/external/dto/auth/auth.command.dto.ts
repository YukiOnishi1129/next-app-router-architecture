import { z } from 'zod'

import type { User } from '@/features/user/types/user'
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
  user?: User
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
  user?: User
  idToken?: string
  refreshToken?: string
  redirectUrl?: Route
}
