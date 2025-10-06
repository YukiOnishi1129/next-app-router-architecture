import { eq, and } from 'drizzle-orm';
import { db } from '../client/db/client';
import { attachments } from '../client/db/schema';
import {
  AttachmentRepository as IAttachmentRepository,
  Attachment,
  AttachmentId,
  RequestId,
} from '../domain';

export class AttachmentRepository implements IAttachmentRepository {
  async findById(id: AttachmentId): Promise<Attachment | null> {
    const result = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id.getValue()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomainEntity(result[0]);
  }

  async findByRequestId(requestId: RequestId): Promise<Attachment[]> {
    const result = await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.requestId, requestId.getValue()),
          eq(attachments.deleted, false)
        )
      );

    return result.map((row) => this.mapToDomainEntity(row));
  }

  async save(entity: Attachment): Promise<void> {
    const data = {
      id: entity.getId().getValue(),
      requestId: entity.getRequestId().getValue(),
      fileName: entity.getFileName(),
      fileSize: entity.getSize().getBytes(),
      mimeType: entity.getMimeType(),
      storageKey: entity.getStorageKey(),
      uploadedById: entity.getUploadedById().getValue(),
      uploadedAt: entity.getUploadedAt(),
      deleted: entity.isDeleted(),
      deletedAt: entity.getDeletedAt(),
      deletedById: entity.getDeletedById()?.getValue() || null,
    };

    await db
      .insert(attachments)
      .values(data)
      .onConflictDoUpdate({
        target: attachments.id,
        set: {
          deleted: data.deleted,
          deletedAt: data.deletedAt,
          deletedById: data.deletedById,
        },
      });
  }

  async delete(id: AttachmentId): Promise<void> {
    // Soft delete by updating the deleted flag
    await db
      .update(attachments)
      .set({
        deleted: true,
        deletedAt: new Date(),
      })
      .where(eq(attachments.id, id.getValue()));
  }

  async deleteByRequestId(requestId: RequestId): Promise<void> {
    // Soft delete all attachments for a request
    await db
      .update(attachments)
      .set({
        deleted: true,
        deletedAt: new Date(),
      })
      .where(eq(attachments.requestId, requestId.getValue()));
  }

  private mapToDomainEntity(row: typeof attachments.$inferSelect): Attachment {
    return Attachment.restore({
      id: row.id,
      requestId: row.requestId,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeInBytes: row.fileSize,
      storageKey: row.storageKey,
      uploadedById: row.uploadedById,
      uploadedAt: row.uploadedAt,
      deleted: row.deleted,
      deletedAt: row.deletedAt,
      deletedById: row.deletedById,
    });
  }
}