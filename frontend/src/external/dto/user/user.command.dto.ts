import { z } from 'zod'

import { UserRole, UserStatus } from '@/external/domain/user/user'

import type { User } from '@/features/user/types/user'

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(UserRole),
})

export const updateUserStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(UserStatus),
})

export const updateUserProfileSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export type UpdateUserRoleInput = z.input<typeof updateUserRoleSchema>
export type UpdateUserStatusInput = z.input<typeof updateUserStatusSchema>
export type UpdateUserProfileInput = z.input<typeof updateUserProfileSchema>

export type UpdateUserResponse = {
  success: boolean
  error?: string
  user?: User
}
