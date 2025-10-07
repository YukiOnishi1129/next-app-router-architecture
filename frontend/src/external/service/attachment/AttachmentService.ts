import {
  Attachment,
  AttachmentId,
  Request,
  RequestId,
  User,
  UserId,
} from "@/external/domain";
import {
  AttachmentRepository,
  RequestRepository,
  UserRepository,
} from "@/external/repository";
import { AuditEventType } from "@/external/domain";
import { AuditService, AuditContext } from "../audit/AuditService";

type UploadAttachmentParams = {
  requestId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: string;
  userId: string;
  context?: AuditContext;
};

type DeleteAttachmentParams = {
  attachmentId: string;
  userId: string;
  context?: AuditContext;
};

type GetAttachmentsParams = {
  requestId: string;
  userId: string;
};

type DownloadAttachmentParams = {
  attachmentId: string;
  userId: string;
  context?: AuditContext;
};

export class AttachmentService {
  private static readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ] as const;

  private readonly attachmentRepository: AttachmentRepository;
  private readonly requestRepository: RequestRepository;
  private readonly userRepository: UserRepository;
  private readonly auditService: AuditService;

  constructor(
    attachmentRepository = new AttachmentRepository(),
    requestRepository = new RequestRepository(),
    userRepository = new UserRepository(),
    auditService = new AuditService()
  ) {
    this.attachmentRepository = attachmentRepository;
    this.requestRepository = requestRepository;
    this.userRepository = userRepository;
    this.auditService = auditService;
  }

  async uploadAttachment(params: UploadAttachmentParams): Promise<Attachment> {
    const { requestId, fileName, fileSize, mimeType, userId, context } = params;

    if (
      !AttachmentService.ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof AttachmentService.ALLOWED_MIME_TYPES)[number]
      )
    ) {
      throw new Error("File type not allowed");
    }

    const request = await this.getRequestOrThrow(requestId);
    const user = await this.getUserOrThrow(userId);
    this.ensureCanModifyAttachments(request, user, userId, true);

    const attachment = Attachment.create({
      requestId,
      fileName,
      mimeType,
      sizeInBytes: fileSize,
      storageKey: this.buildStorageKey(requestId, fileName),
      uploadedById: userId,
    });

    await this.attachmentRepository.save(attachment);

    request.addAttachment(attachment.getId().getValue());
    await Promise.all([
      this.requestRepository.save(request),
      this.auditService.logAction({
        action: "attachment.upload",
        entityType: "ATTACHMENT",
        entityId: attachment.getId().getValue(),
        userId,
        eventType: AuditEventType.REQUEST_UPDATED,
        metadata: {
          requestId,
          fileName,
          fileSize,
          mimeType,
        },
        context,
      }),
    ]);

    return attachment;
  }

  async deleteAttachment(params: DeleteAttachmentParams): Promise<void> {
    const { attachmentId, userId, context } = params;

    const attachment = await this.getAttachmentOrThrow(attachmentId);
    const request = await this.getRequestOrThrow(
      attachment.getRequestId().getValue()
    );
    const user = await this.getUserOrThrow(userId);
    this.ensureCanModifyAttachments(request, user, userId, false, attachment);

    request.removeAttachment(attachmentId);
    await this.requestRepository.save(request);

    attachment.delete(userId);
    await Promise.all([
      this.attachmentRepository.save(attachment),
      this.auditService.logAction({
        action: "attachment.delete",
        entityType: "ATTACHMENT",
        entityId: attachmentId,
        userId,
        eventType: AuditEventType.REQUEST_UPDATED,
        metadata: {
          requestId: attachment.getRequestId().getValue(),
          fileName: attachment.getFileName(),
          deletedByAdmin:
            attachment.getUploadedById().getValue() !== userId &&
            user.isAdmin(),
        },
        context,
      }),
    ]);
  }

  async getAttachments(params: GetAttachmentsParams): Promise<Attachment[]> {
    const { requestId, userId } = params;
    const request = await this.getRequestOrThrow(requestId);
    const user = await this.getUserOrThrow(userId);
    this.ensureCanViewAttachments(request, user, userId);

    return this.attachmentRepository.findByRequestId(
      RequestId.create(requestId)
    );
  }

  async downloadAttachment(
    params: DownloadAttachmentParams
  ): Promise<{ data: string; attachment: Attachment }> {
    const { attachmentId, userId, context } = params;

    const attachment = await this.getAttachmentOrThrow(attachmentId);
    const request = await this.getRequestOrThrow(
      attachment.getRequestId().getValue()
    );
    const user = await this.getUserOrThrow(userId);
    this.ensureCanViewAttachments(request, user, userId);

    const mockData = "SGVsbG8gV29ybGQh";

    await this.auditService.logAction({
      action: "attachment.download",
      entityType: "ATTACHMENT",
      entityId: attachmentId,
      userId,
      eventType: AuditEventType.SYSTEM_ERROR,
      metadata: {
        requestId: attachment.getRequestId().getValue(),
        fileName: attachment.getFileName(),
      },
      context,
    });

    return {
      data: mockData,
      attachment,
    };
  }

  private async getRequestOrThrow(requestId: string): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error("Request not found");
    }
    return request;
  }

  private async getUserOrThrow(userId: string): Promise<User> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  private async getAttachmentOrThrow(
    attachmentId: string
  ): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(
      AttachmentId.create(attachmentId)
    );
    if (!attachment) {
      throw new Error("Attachment not found");
    }
    return attachment;
  }

  private ensureCanModifyAttachments(
    request: Request,
    user: User,
    userId: string,
    isUpload: boolean,
    attachment?: Attachment
  ): void {
    if (!this.canAccessRequest(request, user, userId)) {
      throw new Error("Unauthorized");
    }

    if (!isUpload && attachment) {
      const isUploader = attachment.getUploadedById().getValue() === userId;
      if (!isUploader && !user.isAdmin()) {
        throw new Error("Unauthorized");
      }
    }
  }

  private ensureCanViewAttachments(
    request: Request,
    user: User,
    userId: string
  ): void {
    if (!this.canAccessRequest(request, user, userId)) {
      throw new Error("Unauthorized");
    }
  }

  private canAccessRequest(
    request: Request,
    user: User,
    userId: string
  ): boolean {
    const isRequester = request.getRequesterId().getValue() === userId;
    const isAssignee = request.getAssigneeId()?.getValue() === userId;
    const isAdmin = user.isAdmin();
    return isRequester || isAssignee || isAdmin;
  }

  private buildStorageKey(requestId: string, fileName: string): string {
    return `attachments/${requestId}/${Date.now()}_${fileName}`;
  }
}
