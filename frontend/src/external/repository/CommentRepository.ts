import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../client/db/client';
import { comments } from '../client/db/schema';
import {
  CommentRepository as ICommentRepository,
  Comment,
  CommentId,
  RequestId,
} from '../domain';

export class CommentRepository implements ICommentRepository {
  async findById(id: CommentId): Promise<Comment | null> {
    const result = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByRequestId(
    requestId: RequestId,
    limit?: number,
    offset?: number
  ): Promise<Comment[]> {
    let query = db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.requestId, requestId.getValue()),
          eq(comments.deleted, false)
        )
      )
      .orderBy(desc(comments.createdAt));

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      query = query.offset(offset);
    }

    const result = await query;
    return result.map((row) => this.mapToDomainEntity(row));
  }

  async countByRequestId(requestId: RequestId): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(comments)
      .where(
        and(
          eq(comments.requestId, requestId.getValue()),
          eq(comments.deleted, false)
        )
      );

    return result[0]?.value || 0;
  }

  async save(entity: Comment): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      content: entity.getContent().getValue(),
      requestId: entity.getRequestId().getValue(),
      authorId: entity.getAuthorId().getValue(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      edited: entity.isEdited(),
      deleted: entity.isDeleted(),
      deletedAt: entity.getDeletedAt(),
    };

    await db
      .insert(comments)
      .values(data)
      .onConflictDoUpdate({
        target: comments.id,
        set: {
          content: data.content,
          updatedAt: data.updatedAt,
          edited: data.edited,
          deleted: data.deleted,
          deletedAt: data.deletedAt,
        },
      });
  }

  async delete(id: CommentId): Promise<void> {
    // Soft delete by updating the deleted flag
    await db
      .update(comments)
      .set({
        deleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id.getValue()));
  }

  private mapToDomainEntity(row: typeof comments.$inferSelect): Comment {
    return Comment.restore({
      id: row.id,
      requestId: row.requestId,
      content: row.content,
      authorId: row.authorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      edited: row.edited,
      deleted: row.deleted,
      deletedAt: row.deletedAt,
    });
  }
}