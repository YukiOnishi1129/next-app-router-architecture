import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'
import {
  refreshIdTokenServer,
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
} from '@/features/auth/servers/token.server'

import {
  updateAccountRoleSchema,
  updateAccountStatusSchema,
  updateAccountProfileSchema,
} from '@/external/dto/account'

import {
  auditService,
  accountManagementService,
  authenticationService,
  SERVER_AUDIT_CONTEXT,
  AuditEventType,
  mapAccountToDto,
} from './shared'

import type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountProfileInput,
  UpdateAccountResponse,
} from '@/external/dto/account'

async function ensureAdmin(sessionAccountId: string) {
  const currentAccount =
    await accountManagementService.findAccountById(sessionAccountId)
  if (!currentAccount || !currentAccount.isAdmin()) {
    throw new Error('Insufficient permissions')
  }
  return currentAccount
}

export async function updateAccountRoleServer(
  data: UpdateAccountRoleInput
): Promise<UpdateAccountResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateAccountRoleSchema.parse(data)

    if (validated.accountId === session.account.id) {
      return { success: false, error: 'Cannot change your own role' }
    }

    const targetAccount = await accountManagementService.findAccountById(
      validated.accountId
    )
    if (!targetAccount) {
      return { success: false, error: 'Account not found' }
    }

    const previousRoles = targetAccount.getRoles()
    const updatedAccount = await accountManagementService.updateAccountRoles(
      validated.accountId,
      [validated.role]
    )

    await auditService.logAction({
      action: 'account.role.update',
      entityType: 'ACCOUNT',
      entityId: validated.accountId,
      accountId: session.account.id,
      metadata: {
        previousRoles,
        newRoles: updatedAccount.getRoles(),
      },
      eventType: AuditEventType.ACCOUNT_ROLE_ASSIGNED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      account: mapAccountToDto(updatedAccount),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update account role',
    }
  }
}

export async function updateAccountStatusServer(
  data: UpdateAccountStatusInput
): Promise<UpdateAccountResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateAccountStatusSchema.parse(data)
    await ensureAdmin(session.account.id)

    if (validated.accountId === session.account.id) {
      return { success: false, error: 'Cannot change your own status' }
    }

    const targetAccount = await accountManagementService.findAccountById(
      validated.accountId
    )
    if (!targetAccount) {
      return { success: false, error: 'Account not found' }
    }

    const previousStatus = targetAccount.getStatus()
    const updatedAccount = await accountManagementService.updateAccountStatus(
      validated.accountId,
      validated.status
    )

    await auditService.logAction({
      action: 'account.status.change',
      entityType: 'ACCOUNT',
      entityId: validated.accountId,
      accountId: session.account.id,
      metadata: {
        previousStatus,
        newStatus: validated.status,
      },
      eventType: AuditEventType.ACCOUNT_STATUS_CHANGED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      account: mapAccountToDto(updatedAccount),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update account status',
    }
  }
}

export async function updateAccountProfileServer(
  data: UpdateAccountProfileInput
): Promise<UpdateAccountResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateAccountProfileSchema.parse(data)

    const currentAccount = await accountManagementService.findAccountById(
      session.account.id
    )
    if (!currentAccount) {
      return { success: false, error: 'Current account not found' }
    }

    const isAdmin = currentAccount.isAdmin()
    const isSelfUpdate = validated.accountId === session.account.id

    if (!isSelfUpdate && !isAdmin) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const targetAccount = await accountManagementService.findAccountById(
      validated.accountId
    )
    if (!targetAccount) {
      return { success: false, error: 'Account not found' }
    }

    const emailChanged = targetAccount.getEmail().getValue() !== validated.email
    const nameChanged = targetAccount.getName() !== validated.name

    if (emailChanged && !isSelfUpdate) {
      return {
        success: false,
        error: 'Only the account owner can change their email address',
      }
    }

    if (isSelfUpdate && (emailChanged || nameChanged)) {
      try {
        const idToken = await refreshIdTokenServer()
        const identityResult = await authenticationService.updateAccountProfile(
          idToken,
          {
            email: emailChanged ? validated.email : undefined,
            displayName: nameChanged ? validated.name : undefined,
          }
        )

        if (identityResult.idToken) {
          await setIdTokenCookieServer(identityResult.idToken)
        }
        if (identityResult.refreshToken) {
          await setRefreshTokenCookieServer(identityResult.refreshToken)
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update identity profile',
        }
      }
    }

    const updatedAccount = await accountManagementService.updateAccountProfile(
      validated.accountId,
      validated.name,
      validated.email
    )

    await auditService.logAction({
      action: 'account.profile.update',
      entityType: 'ACCOUNT',
      entityId: validated.accountId,
      accountId: session.account.id,
      metadata: {
        updatedFields: [
          targetAccount.getName() !== validated.name ? 'name' : undefined,
          targetAccount.getEmail().getValue() !== validated.email
            ? 'email'
            : undefined,
        ].filter(Boolean),
        isSelfUpdate,
      },
      eventType: AuditEventType.ACCOUNT_UPDATED,
      context: SERVER_AUDIT_CONTEXT,
    })

    return {
      success: true,
      account: mapAccountToDto(updatedAccount),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update account profile',
    }
  }
}

export type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountProfileInput,
  UpdateAccountResponse,
} from '@/external/dto/account'
