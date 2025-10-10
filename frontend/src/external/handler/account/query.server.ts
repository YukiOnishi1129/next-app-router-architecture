import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'

import { listAccountsSchema } from '@/external/dto/account'

import { accountManagementService, mapAccountToDto } from './shared'

import type {
  ListAccountsInput,
  ListAccountsResponse,
  GetAccountResponse,
} from '@/external/dto/account'

export async function listAccountsServer(
  data?: ListAccountsInput
): Promise<ListAccountsResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = listAccountsSchema.parse(data ?? {})

    const currentAccount = await accountManagementService.findAccountById(
      session.account.id
    )
    if (!currentAccount || !currentAccount.isAdmin()) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const { accounts, total, limit, offset } =
      await accountManagementService.listAccounts(validated)

    return {
      success: true,
      accounts: accounts.map(mapAccountToDto),
      total,
      limit,
      offset,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list accounts',
    }
  }
}

export async function getAccountServer(
  accountId: string
): Promise<GetAccountResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const currentAccount = await accountManagementService.findAccountById(
      session.account.id
    )
    if (!currentAccount) {
      return { success: false, error: 'Current account not found' }
    }

    const isAdmin = currentAccount.isAdmin()
    const isSelfView = accountId === session.account.id

    if (!isSelfView && !isAdmin) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const account = await accountManagementService.findAccountById(accountId)
    if (!account) {
      return { success: false, error: 'Account not found' }
    }

    return {
      success: true,
      account: mapAccountToDto(account),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get account',
    }
  }
}

export async function getCurrentAccountServer(): Promise<GetAccountResponse> {
  const session = await getSessionServer()
  if (!session?.account) {
    return { success: false, error: 'Unauthorized' }
  }

  return getAccountServer(session.account.id)
}

export type {
  ListAccountsInput,
  ListAccountsResponse,
  GetAccountResponse,
} from '@/external/dto/account'
