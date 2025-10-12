import 'server-only'

import { ZodError } from 'zod'

import { getSessionServer } from '@/features/auth/servers/session.server'
import { refreshIdTokenServer } from '@/features/auth/servers/token.server'

import {
  updateAccountRoleSchema,
  updateAccountStatusSchema,
  updateAccountNameSchema,
  requestAccountEmailChangeSchema,
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
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
} from '@/external/dto/account'

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')
const EMAIL_CHANGE_VERIFICATION_PATH = '/auth/verify-email-change'

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

export async function updateAccountNameServer(
  data: UpdateAccountNameInput
): Promise<UpdateAccountResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = updateAccountNameSchema.parse(data)

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

    const nameChanged = targetAccount.getName() !== validated.name

    const updatedAccount = nameChanged
      ? await accountManagementService.updateAccount(validated.accountId, {
          name: validated.name,
        })
      : targetAccount

    if (nameChanged) {
      await auditService.logAction({
        action: 'account.profile.update',
        entityType: 'ACCOUNT',
        entityId: validated.accountId,
        accountId: session.account.id,
        metadata: {
          updatedFields: ['name'],
          isSelfUpdate,
        },
        eventType: AuditEventType.ACCOUNT_UPDATED,
        context: SERVER_AUDIT_CONTEXT,
      })
    }

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

export async function requestAccountEmailChangeServer(
  data: RequestAccountEmailChangeInput
): Promise<RequestAccountEmailChangeResponse> {
  try {
    const session = await getSessionServer()
    if (!session?.account) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = requestAccountEmailChangeSchema.parse(data)

    if (validated.accountId !== session.account.id) {
      return {
        success: false,
        error: 'Only the account owner can request an email change',
      }
    }

    const account = await accountManagementService.findAccountById(
      validated.accountId
    )
    if (!account) {
      return { success: false, error: 'Account not found' }
    }

    if (account.getEmail().getValue() === validated.newEmail) {
      return {
        success: true,
        pendingEmail: validated.newEmail,
      }
    }

    const idToken = await refreshIdTokenServer()
    const verificationUrl = new URL(
      EMAIL_CHANGE_VERIFICATION_PATH,
      APP_BASE_URL
    )

    await authenticationService.sendEmailChangeVerification(
      idToken,
      validated.newEmail,
      {
        verificationContinueUrl: verificationUrl.toString(),
      }
    )

    return {
      success: true,
      pendingEmail: validated.newEmail,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    const message =
      error instanceof Error ? error.message : 'Failed to request email change'
    if (message.includes('CREDENTIAL_TOO_OLD_LOGIN_AGAIN')) {
      return {
        success: false,
        error:
          'Please sign out and sign in again before changing your email address. This helps keep your account secure.',
      }
    }
    return { success: false, error: message }
  }
}

export type {
  UpdateAccountRoleInput,
  UpdateAccountStatusInput,
  UpdateAccountNameInput,
  RequestAccountEmailChangeInput,
  UpdateAccountResponse,
  RequestAccountEmailChangeResponse,
} from '@/external/dto/account'
