'use server'

import {
  updateAccountRoleServer,
  updateAccountStatusServer,
  updateAccountProfileServer,
} from './command.server'

import type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountProfileInput,
  UpdateAccountResponse,
} from './command.server'

export async function updateAccountRoleAction(
  data: UpdateAccountRoleInput
): Promise<UpdateAccountResponse> {
  return updateAccountRoleServer(data)
}

export async function updateAccountStatusAction(
  data: UpdateAccountStatusInput
): Promise<UpdateAccountResponse> {
  return updateAccountStatusServer(data)
}

export async function updateAccountProfileAction(
  data: UpdateAccountProfileInput
): Promise<UpdateAccountResponse> {
  return updateAccountProfileServer(data)
}

export type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountProfileInput,
  UpdateAccountResponse,
} from './command.server'
