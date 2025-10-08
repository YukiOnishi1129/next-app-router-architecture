import { z } from 'zod'

import { UserRole, UserStatus } from '@/external/domain/user/user'

import type { UserDto } from './user.dto'

export const listUsersSchema = z.object({
  status: z.enum(UserStatus).optional(),
  role: z.enum(UserRole).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export type ListUsersInput = z.input<typeof listUsersSchema>

export type ListUsersResponse = {
  success: boolean
  error?: string
  users?: UserDto[]
  total?: number
  limit?: number
  offset?: number
}

export type GetUserResponse = {
  success: boolean
  error?: string
  user?: UserDto
}
