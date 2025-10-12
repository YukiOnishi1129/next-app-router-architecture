'use server'

import {
  updateAccountRoleServer,
  updateAccountStatusServer,
  updateAccountNameServer,
  requestAccountEmailChangeServer,
  updateAccountPasswordServer,
} from './command.server'

import type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountPasswordInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
  UpdateAccountPasswordResponse,
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

export async function updateAccountPasswordAction(
  data: UpdateAccountPasswordInput
): Promise<UpdateAccountPasswordResponse> {
  return updateAccountPasswordServer(data)
}

export type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountPasswordInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
  UpdateAccountPasswordResponse,
} from './command.server'
