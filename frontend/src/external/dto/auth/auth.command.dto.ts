import { z } from 'zod'

import type { UserDto } from '../user/user.dto'
import type { Route } from 'next'

const redirectUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith('/') || value.startsWith('http'),
    'Redirect URL must be an absolute URL or an internal path'
  )

export const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: redirectUrlSchema.optional(),
})

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  redirectUrl: redirectUrlSchema.optional(),
})

export type CreateSessionInput = z.input<typeof createSessionSchema>
export type CreateUserInput = z.input<typeof createUserSchema>

export type CreateSessionResponse = {
  success: boolean
  error?: string
  user?: UserDto
  redirectUrl?: Route
}

export type CreateUserResponse = {
  success: boolean
  error?: string
  user?: UserDto
  redirectUrl?: Route
}

export type DeleteSessionResponse = {
  success: boolean
  error?: string
}
