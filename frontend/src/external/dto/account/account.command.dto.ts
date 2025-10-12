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

export const updateAccountNameSchema = z.object({
  accountId: z.string(),
  name: z.string().min(1).max(100),
})

export const requestAccountEmailChangeSchema = z.object({
  accountId: z.string(),
  newEmail: z.email(),
})

export type UpdateAccountRoleInput = z.input<typeof updateAccountRoleSchema>
export type UpdateAccountStatusInput = z.input<typeof updateAccountStatusSchema>
export type UpdateAccountNameInput = z.input<typeof updateAccountNameSchema>
export type RequestAccountEmailChangeInput = z.input<
  typeof requestAccountEmailChangeSchema
>

export type UpdateAccountResponse = {
  success: boolean
  error?: string
  account?: Account
}

export type RequestAccountEmailChangeResponse = {
  success: boolean
  error?: string
  pendingEmail?: string
}

export const confirmEmailChangeSchema = z.object({
  accountId: z.string(),
})

export type ConfirmEmailChangeInput = z.input<typeof confirmEmailChangeSchema>

export type ConfirmEmailChangeResponse = {
  success: boolean
  error?: string
  account?: Account
}
