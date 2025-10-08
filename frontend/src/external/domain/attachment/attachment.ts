import { UserId } from "../user";
import { RequestId } from "../request";
import { AttachmentId } from "./attachment-id";

/**
 * FileSize value object
 */
export class FileSize {
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  constructor(private readonly bytes: number) {
    this.validate(bytes);
  }

  private validate(bytes: number): void {
    if (bytes < 0) {
      throw new Error("File size cannot be negative");
    }
    if (bytes > FileSize.MAX_SIZE_BYTES) {
      throw new Error(
        `File size exceeds maximum allowed size of ${FileSize.MAX_SIZE_BYTES} bytes`
      );
    }
  }

  getBytes(): number {
    return this.bytes;
  }

  getKilobytes(): number {
    return this.bytes / 1024;
  }

  getMegabytes(): number {
    return this.bytes / (1024 * 1024);
  }

  toHumanReadable(): string {
    const mb = this.getMegabytes();
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = this.getKilobytes();
    if (kb >= 1) {
      return `${kb.toFixed(2)} KB`;
    }
    return `${this.bytes} bytes`;
  }
}

/**
 * Attachment entity - represents a file attached to a request
 */
export class Attachment {
  private constructor(
    private readonly id: AttachmentId,
    private readonly requestId: RequestId,
    private readonly fileName: string,
    private readonly mimeType: string,
    private readonly size: FileSize,
    private readonly storageKey: string,
    private readonly uploadedById: UserId,
    private readonly uploadedAt: Date,
    private deleted: boolean,
    private deletedAt: Date | null,
    private deletedById: UserId | null
  ) {}

  static create(params: {
    requestId: string;
    fileName: string;
    mimeType: string;
    sizeInBytes: number;
    storageKey: string;
    uploadedById: string;
  }): Attachment {
    return new Attachment(
      AttachmentId.generate(),
      RequestId.create(params.requestId),
      params.fileName,
      params.mimeType,
      new FileSize(params.sizeInBytes),
      params.storageKey,
      UserId.create(params.uploadedById),
      new Date(),
      false,
      null,
      null
    );
  }

  static restore(params: {
    id: string;
    requestId: string;
    fileName: string;
    mimeType: string;
    sizeInBytes: number;
    storageKey: string;
    uploadedById: string;
    uploadedAt: Date;
    deleted: boolean;
    deletedAt: Date | null;
    deletedById: string | null;
  }): Attachment {
    return new Attachment(
      AttachmentId.create(params.id),
      RequestId.create(params.requestId),
      params.fileName,
      params.mimeType,
      new FileSize(params.sizeInBytes),
      params.storageKey,
      UserId.create(params.uploadedById),
      params.uploadedAt,
      params.deleted,
      params.deletedAt,
      params.deletedById ? UserId.create(params.deletedById) : null
    );
  }

  getId(): AttachmentId {
    return this.id;
  }

  getRequestId(): RequestId {
    return this.requestId;
  }

  getFileName(): string {
    return this.fileName;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getSize(): FileSize {
    return this.size;
  }

  getStorageKey(): string {
    return this.storageKey;
  }

  getUploadedById(): UserId {
    return this.uploadedById;
  }

  getUploadedAt(): Date {
    return new Date(this.uploadedAt);
  }

  isDeleted(): boolean {
    return this.deleted;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt ? new Date(this.deletedAt) : null;
  }

  getDeletedById(): UserId | null {
    return this.deletedById;
  }

  isImage(): boolean {
    return this.mimeType.startsWith("image/");
  }

  isPdf(): boolean {
    return this.mimeType === "application/pdf";
  }

  isDocument(): boolean {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    return documentTypes.includes(this.mimeType);
  }

  delete(deletedById: string): void {
    if (this.deleted) {
      throw new Error("Attachment is already deleted");
    }
    this.deleted = true;
    this.deletedAt = new Date();
    this.deletedById = UserId.create(deletedById);
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      requestId: this.requestId.getValue(),
      fileName: this.fileName,
      mimeType: this.mimeType,
      size: {
        bytes: this.size.getBytes(),
        humanReadable: this.size.toHumanReadable(),
      },
      storageKey: this.storageKey,
      uploadedById: this.uploadedById.getValue(),
      uploadedAt: this.uploadedAt.toISOString(),
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString() || null,
      deletedById: this.deletedById?.getValue() || null,
    };
  }
}
