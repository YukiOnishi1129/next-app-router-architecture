'use server'

import {
  getCurrentAccountServer,
  getAccountServer,
  listAccountsServer,
} from './query.server'

import type {
  GetAccountResponse,
  ListAccountsInput,
  ListAccountsResponse,
} from './query.server'

export async function listAccountsAction(
  data?: ListAccountsInput
): Promise<ListAccountsResponse> {
  return listAccountsServer(data)
}

export async function getAccountAction(
  accountId: string
): Promise<GetAccountResponse> {
  return getAccountServer(accountId)
}

export async function getCurrentAccountAction(): Promise<GetAccountResponse> {
  return getCurrentAccountServer()
}

export type {
  ListAccountsInput,
  ListAccountsResponse,
  GetAccountResponse,
} from './query.server'
