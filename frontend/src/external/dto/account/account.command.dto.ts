import { z } from 'zod'

import { AccountRole, AccountStatus } from '@/external/domain/account/account'

import type { Account } from '@/features/account/types/account'

export const updateAccountRoleSchema = z.object({
  accountId: z.string(),
  role: z.enum(AccountRole),
})

export const updateAccountStatusSchema = z.object({
  accountId: z.string(),
  status: z.enum(AccountStatus),
})

export const updateAccountProfileSchema = z.object({
  accountId: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

export type UpdateAccountRoleInput = z.input<typeof updateAccountRoleSchema>
export type UpdateAccountStatusInput = z.input<typeof updateAccountStatusSchema>
export type UpdateAccountProfileInput = z.input<
  typeof updateAccountProfileSchema
>

export type UpdateAccountResponse = {
  success: boolean
  error?: string
  account?: Account
}
