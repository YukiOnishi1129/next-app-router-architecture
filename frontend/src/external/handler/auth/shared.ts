import { AuditService } from '@/external/service/audit/AuditService'
import { AccountManagementService } from '@/external/service/auth/AccountManagementService'
import { AuthenticationService } from '@/external/service/auth/AuthenticationService'

import type { AuditContext } from '@/external/service/audit/AuditService'

export const authService = new AuthenticationService({
  apiKey: process.env.GCP_IDENTITY_PLATFORM_API_KEY!,
  projectId: process.env.GCP_PROJECT_ID!,
})

export const accountManagementService = new AccountManagementService()
export const auditService = new AuditService()

export const SERVER_CONTEXT: AuditContext = {
  ipAddress: 'server',
  userAgent: 'server-action',
}
