import { eq, and, desc, count } from "drizzle-orm";
import { db } from "../client/db/client";
import { requests } from "../client/db/schema";
import {
  RequestRepository as IRequestRepository,
  Request,
  RequestId,
  UserId,
  RequestStatus,
  RequestType,
  RequestPriority,
} from "../domain";

// Type mapping between domain and database
type DbRequestType = "BUDGET" | "LEAVE" | "EQUIPMENT" | "OTHER";
type DbRequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type DbRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export class RequestRepository implements IRequestRepository {
  async findById(id: RequestId): Promise<Request | null> {
    const result = await db
      .select()
      .from(requests)
      .where(eq(requests.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByRequesterId(
    requesterId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Request[]> {
    let query = db
      .select()
      .from(requests)
      .where(eq(requests.requesterId, requesterId.getValue()))
      .orderBy(desc(requests.createdAt));

    // Type assertion to handle Drizzle's type limitations
    const dynamicQuery = query as any;
    if (limit !== undefined) {
      query = dynamicQuery.limit(limit);
    }
    if (offset !== undefined) {
      query = dynamicQuery.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async findByAssigneeId(
    assigneeId: UserId,
    limit?: number,
    offset?: number
  ): Promise<Request[]> {
    let query = db
      .select()
      .from(requests)
      .where(eq(requests.assigneeId, assigneeId.getValue()))
      .orderBy(desc(requests.createdAt));

    // Type assertion to handle Drizzle's type limitations
    const dynamicQuery = query as any;
    if (limit !== undefined) {
      query = dynamicQuery.limit(limit);
    }
    if (offset !== undefined) {
      query = dynamicQuery.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async findByStatus(
    status: RequestStatus,
    limit?: number,
    offset?: number
  ): Promise<Request[]> {
    let query = db
      .select()
      .from(requests)
      .where(eq(requests.status, status as DbRequestStatus))
      .orderBy(desc(requests.createdAt));

    // Type assertion to handle Drizzle's type limitations
    const dynamicQuery = query as any;
    if (limit !== undefined) {
      query = dynamicQuery.limit(limit);
    }
    if (offset !== undefined) {
      query = dynamicQuery.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async countByStatus(status: RequestStatus): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(requests)
      .where(eq(requests.status, status));

    return result[0]?.value ?? 0;
  }

  async save(entity: Request): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      type: this.mapRequestTypeToDb(entity.getType()),
      priority: entity.getPriority() as DbRequestPriority,
      status: entity.getStatus() as DbRequestStatus,
      requesterId: entity.getRequesterId().getValue(),
      assigneeId: entity.getAssigneeId()?.getValue() || null,
      attachmentIds: entity.getAttachmentIds() as string[],
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      submittedAt: entity.getSubmittedAt(),
      reviewedAt: entity.getReviewedAt(),
      reviewerId: entity.getReviewerId()?.getValue() || null,
    };

    await db
      .insert(requests)
      .values(data)
      .onConflictDoUpdate({
        target: requests.id,
        set: {
          title: data.title,
          description: data.description,
          type: data.type,
          priority: data.priority,
          status: data.status,
          assigneeId: data.assigneeId,
          attachmentIds: data.attachmentIds as string[],
          updatedAt: data.updatedAt,
          submittedAt: data.submittedAt,
          reviewedAt: data.reviewedAt,
          reviewerId: data.reviewerId,
        },
      });

    // Clear domain events after successful save
    entity.clearDomainEvents();
  }

  async delete(id: RequestId): Promise<void> {
    await db.delete(requests).where(eq(requests.id, id.getValue()));
  }

  private mapToDomainEntity(row: typeof requests.$inferSelect): Request {
    return Request.restore({
      id: row.id,
      title: row.title,
      description: row.description,
      type: this.mapRequestTypeFromDb(row.type as DbRequestType),
      priority: row.priority as RequestPriority,
      status: row.status as RequestStatus,
      requesterId: row.requesterId,
      assigneeId: row.assigneeId,
      attachmentIds: row.attachmentIds,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      reviewerId: row.reviewerId,
    });
  }

  private mapRequestTypeToDb(type: RequestType): DbRequestType {
    const mapping: Record<RequestType, DbRequestType> = {
      [RequestType.LEAVE]: "LEAVE",
      [RequestType.EQUIPMENT]: "EQUIPMENT",
      [RequestType.EXPENSE]: "BUDGET",
      [RequestType.ACCESS]: "OTHER",
      [RequestType.OTHER]: "OTHER",
    };
    return mapping[type];
  }

  private mapRequestTypeFromDb(type: DbRequestType): RequestType {
    const mapping: Record<DbRequestType, RequestType> = {
      BUDGET: RequestType.EXPENSE,
      LEAVE: RequestType.LEAVE,
      EQUIPMENT: RequestType.EQUIPMENT,
      OTHER: RequestType.OTHER,
    };
    return mapping[type];
  }
}
