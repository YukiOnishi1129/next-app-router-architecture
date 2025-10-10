import { Request } from './request'
import { RequestId } from './request-id'
import { RequestStatus } from './request-status'
import { AccountId } from '../account'
import { Repository } from '../shared/repository'

/**
 * Request repository interface
 */
export interface RequestRepository extends Repository<Request, RequestId> {
  findAll(limit?: number, offset?: number): Promise<Request[]>
  findByRequesterId(
    requesterId: AccountId,
    limit?: number,
    offset?: number
  ): Promise<Request[]>
  findByAssigneeId(
    assigneeId: AccountId,
    limit?: number,
    offset?: number
  ): Promise<Request[]>
  findByStatus(
    status: RequestStatus,
    limit?: number,
    offset?: number
  ): Promise<Request[]>
  countByStatus(status: RequestStatus): Promise<number>
}
