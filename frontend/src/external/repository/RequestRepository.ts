import { eq, and, desc } from 'drizzle-orm';
import { db } from '../client/db/client';
import { requests } from '../client/db/schema';
import {
  RequestRepository as IRequestRepository,
  Request,
  RequestId,
  UserId,
  RequestStatus,
  RequestType,
  RequestPriority,
} from '../domain';

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

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
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

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
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
      .where(eq(requests.status, status))
      .orderBy(desc(requests.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async countByStatus(status: RequestStatus): Promise<number> {
    const result = await db
      .select({ count: requests.id })
      .from(requests)
      .where(eq(requests.status, status));

    return result.length;
  }

  async save(entity: Request): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      type: entity.getType(),
      priority: entity.getPriority(),
      status: entity.getStatus(),
      requesterId: entity.getRequesterId().getValue(),
      assigneeId: entity.getAssigneeId()?.getValue() || null,
      attachmentIds: entity.getAttachmentIds(),
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
          attachmentIds: data.attachmentIds,
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
      type: row.type as RequestType,
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
}