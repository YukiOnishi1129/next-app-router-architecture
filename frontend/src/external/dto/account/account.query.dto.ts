import { z } from 'zod'

import { AccountRole, AccountStatus } from '@/external/domain/account/account'

import type { Account } from '@/features/account/types/account'

export const listAccountsSchema = z.object({
  status: z.enum(AccountStatus).optional(),
  role: z.enum(AccountRole).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export type ListAccountsInput = z.input<typeof listAccountsSchema>

export type ListAccountsResponse = {
  success: boolean
  error?: string
  accounts?: Account[]
  total?: number
  limit?: number
  offset?: number
}

export type GetAccountResponse = {
  success: boolean
  error?: string
  account?: Account
}
