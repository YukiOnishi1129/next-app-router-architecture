'use server'

import {
  updateAccountRoleServer,
  updateAccountStatusServer,
  updateAccountNameServer,
  requestAccountEmailChangeServer,
} from './command.server'

import type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
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

export async function updateAccountNameAction(
  data: UpdateAccountNameInput
): Promise<UpdateAccountResponse> {
  return updateAccountNameServer(data)
}

export async function requestAccountEmailChangeAction(
  data: RequestAccountEmailChangeInput
): Promise<RequestAccountEmailChangeResponse> {
  return requestAccountEmailChangeServer(data)
}

export type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
} from './command.server'
