import { AuditEventType } from '@/external/domain'
import { User } from '@/external/domain/user/user'
import { AuditService } from '@/external/service/audit/AuditService'
import { UserManagementService } from '@/external/service/auth/UserManagementService'

import type { User as UserType } from '@/features/user/types/user'

export const userManagementService = new UserManagementService()
export const auditService = new AuditService()

export const SERVER_AUDIT_CONTEXT = {
  ipAddress: 'server',
  userAgent: 'server-command',
}

export function mapUserToDto(user: User): UserType {
  return {
    id: user.getId().getValue(),
    name: user.getName(),
    email: user.getEmail().getValue(),
    status: user.getStatus(),
    roles: user.getRoles(),
    createdAt: user.getCreatedAt().toISOString(),
    updatedAt: user.getUpdatedAt().toISOString(),
  }
}

export { AuditEventType }
