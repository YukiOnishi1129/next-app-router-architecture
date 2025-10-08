import { Request } from "./request";
import { RequestId } from "./request-id";
import { RequestStatus } from "./request-status";
import { Repository } from "../shared/repository";
import { UserId } from "../user";

/**
 * Request repository interface
 */
export interface RequestRepository extends Repository<Request, RequestId> {
  findAll(limit?: number, offset?: number): Promise<Request[]>;
  findByRequesterId(
    requesterId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Request[]>;
  findByAssigneeId(
    assigneeId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Request[]>;
  findByStatus(
    status: RequestStatus,
    limit?: number,
    offset?: number
  ): Promise<Request[]>;
  countByStatus(status: RequestStatus): Promise<number>;
}
