import { AuditLog, AuditEventType } from './audit-log'
import { AuditLogId } from './audit-log-id'
import { AccountId } from '../account'
import { Repository } from '../shared/repository'

/**
 * Filter criteria for audit logs
 */
export interface AuditLogFilter {
  eventType?: AuditEventType
  entityType?: string
  entityId?: string
  actorId?: AccountId
  startDate?: Date
  endDate?: Date
}

/**
 * AuditLog repository interface
 */
export interface AuditLogRepository extends Repository<AuditLog, AuditLogId> {
  findByFilter(
    filter: AuditLogFilter,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]>
  findByEntityId(entityType: string, entityId: string): Promise<AuditLog[]>
  findByActorId(
    actorId: AccountId,
    limit?: number,
    offset?: number
  ): Promise<AuditLog[]>
}
