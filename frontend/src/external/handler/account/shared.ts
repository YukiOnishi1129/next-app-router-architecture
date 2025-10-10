import { AuditEventType } from '@/external/domain'
import { Account } from '@/external/domain/account/account'
import { AuditService } from '@/external/service/audit/AuditService'
import { AccountManagementService } from '@/external/service/auth/AccountManagementService'

import type { Account as AccountType } from '@/features/account/types/account'

export const accountManagementService = new AccountManagementService()
export const auditService = new AuditService()

export const SERVER_AUDIT_CONTEXT = {
  ipAddress: 'server',
  userAgent: 'server-command',
}

export function mapAccountToDto(account: Account): AccountType {
  return {
    id: account.getId().getValue(),
    name: account.getName(),
    email: account.getEmail().getValue(),
    status: account.getStatus(),
    roles: account.getRoles(),
    createdAt: account.getCreatedAt().toISOString(),
    updatedAt: account.getUpdatedAt().toISOString(),
  }
}

export { AuditEventType }
