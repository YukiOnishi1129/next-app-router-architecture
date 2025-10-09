import { z } from 'zod'

import type { Route } from 'next'

export const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: z.string().url().optional(),
})

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  redirectUrl: z.string().url().optional(),
})

export type CreateSessionInput = z.input<typeof createSessionSchema>
export type CreateUserInput = z.input<typeof createUserSchema>

export type CreateSessionResponse = {
  success: boolean
  error?: string
  redirectUrl?: Route
}

export type CreateUserResponse = {
  success: boolean
  error?: string
  redirectUrl?: Route
}

export type DeleteSessionResponse = {
  success: boolean
  error?: string
}
