import {
  Attachment,
  AttachmentId,
  Request,
  RequestId,
  Account,
  AccountId,
  AuditEventType,
} from '@/external/domain'
import {
  AttachmentRepository,
  RequestRepository,
  AccountRepository,
} from '@/external/repository'

import { AuditService, AuditContext } from '../audit/AuditService'

type UploadAttachmentParams = {
  requestId: string
  fileName: string
  fileSize: number
  mimeType: string
  data: string
  accountId: string
  context?: AuditContext
}

type DeleteAttachmentParams = {
  attachmentId: string
  accountId: string
  context?: AuditContext
}

type GetAttachmentsParams = {
  requestId: string
  accountId: string
}

type DownloadAttachmentParams = {
  attachmentId: string
  accountId: string
  context?: AuditContext
}

export class AttachmentService {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ] as const

  private readonly attachmentRepository: AttachmentRepository
  private readonly requestRepository: RequestRepository
  private readonly userRepository: AccountRepository
  private readonly auditService: AuditService

  constructor(
    attachmentRepository = new AttachmentRepository(),
    requestRepository = new RequestRepository(),
    userRepository = new AccountRepository(),
    auditService = new AuditService()
  ) {
    this.attachmentRepository = attachmentRepository
    this.requestRepository = requestRepository
    this.userRepository = userRepository
    this.auditService = auditService
  }

  async uploadAttachment(params: UploadAttachmentParams): Promise<Attachment> {
    const { requestId, fileName, fileSize, mimeType, accountId, context } =
      params

    if (
      !AttachmentService.ALLOWED_MIME_TYPES.includes(
        mimeType as (typeof AttachmentService.ALLOWED_MIME_TYPES)[number]
      )
    ) {
      throw new Error('File type not allowed')
    }

    const request = await this.getRequestOrThrow(requestId)
    const account = await this.getAccountOrThrow(accountId)
    this.ensureCanModifyAttachments(request, account, accountId, true)

    const attachment = Attachment.create({
      requestId,
      fileName,
      mimeType,
      sizeInBytes: fileSize,
      storageKey: this.buildStorageKey(requestId, fileName),
      uploadedById: accountId,
    })

    await this.attachmentRepository.save(attachment)

    request.addAttachment(attachment.getId().getValue())
    await Promise.all([
      this.requestRepository.save(request),
      this.auditService.logAction({
        action: 'attachment.upload',
        entityType: 'ATTACHMENT',
        entityId: attachment.getId().getValue(),
        accountId,
        eventType: AuditEventType.REQUEST_UPDATED,
        metadata: {
          requestId,
          fileName,
          fileSize,
          mimeType,
        },
        context,
      }),
    ])

    return attachment
  }

  async deleteAttachment(params: DeleteAttachmentParams): Promise<void> {
    const { attachmentId, accountId, context } = params

    const attachment = await this.getAttachmentOrThrow(attachmentId)
    const request = await this.getRequestOrThrow(
      attachment.getRequestId().getValue()
    )
    const user = await this.getAccountOrThrow(accountId)
    this.ensureCanModifyAttachments(request, user, accountId, false, attachment)

    request.removeAttachment(attachmentId)
    await this.requestRepository.save(request)

    attachment.delete(accountId)
    await Promise.all([
      this.attachmentRepository.save(attachment),
      this.auditService.logAction({
        action: 'attachment.delete',
        entityType: 'ATTACHMENT',
        entityId: attachmentId,
        accountId,
        eventType: AuditEventType.REQUEST_UPDATED,
        metadata: {
          requestId: attachment.getRequestId().getValue(),
          fileName: attachment.getFileName(),
          deletedByAdmin:
            attachment.getUploadedById().getValue() !== accountId &&
            user.isAdmin(),
        },
        context,
      }),
    ])
  }

  async getAttachments(params: GetAttachmentsParams): Promise<Attachment[]> {
    const { requestId, accountId } = params
    const request = await this.getRequestOrThrow(requestId)
    const user = await this.getAccountOrThrow(accountId)
    this.ensureCanViewAttachments(request, user, accountId)

    return this.attachmentRepository.findByRequestId(
      RequestId.create(requestId)
    )
  }

  async downloadAttachment(
    params: DownloadAttachmentParams
  ): Promise<{ data: string; attachment: Attachment }> {
    const { attachmentId, accountId, context } = params

    const attachment = await this.getAttachmentOrThrow(attachmentId)
    const request = await this.getRequestOrThrow(
      attachment.getRequestId().getValue()
    )
    const user = await this.getAccountOrThrow(accountId)
    this.ensureCanViewAttachments(request, user, accountId)

    const mockData = 'SGVsbG8gV29ybGQh'

    await this.auditService.logAction({
      action: 'attachment.download',
      entityType: 'ATTACHMENT',
      entityId: attachmentId,
      accountId: accountId,
      eventType: AuditEventType.SYSTEM_ERROR,
      metadata: {
        requestId: attachment.getRequestId().getValue(),
        fileName: attachment.getFileName(),
      },
      context,
    })

    return {
      data: mockData,
      attachment,
    }
  }

  private async getRequestOrThrow(requestId: string): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    )
    if (!request) {
      throw new Error('Request not found')
    }
    return request
  }

  private async getAccountOrThrow(accountId: string): Promise<Account> {
    const user = await this.userRepository.findById(AccountId.create(accountId))
    if (!user) {
      throw new Error('Account not found')
    }
    return user
  }

  private async getAttachmentOrThrow(
    attachmentId: string
  ): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findById(
      AttachmentId.create(attachmentId)
    )
    if (!attachment) {
      throw new Error('Attachment not found')
    }
    return attachment
  }

  private ensureCanModifyAttachments(
    request: Request,
    account: Account,
    accountId: string,
    isUpload: boolean,
    attachment?: Attachment
  ): void {
    if (!this.canAccessRequest(request, account, accountId)) {
      throw new Error('Unauthorized')
    }

    if (!isUpload && attachment) {
      const isUploader = attachment.getUploadedById().getValue() === accountId
      if (!isUploader && !account.isAdmin()) {
        throw new Error('Unauthorized')
      }
    }
  }

  private ensureCanViewAttachments(
    request: Request,
    account: Account,
    accountId: string
  ): void {
    if (!this.canAccessRequest(request, account, accountId)) {
      throw new Error('Unauthorized')
    }
  }

  private canAccessRequest(
    request: Request,
    account: Account,
    accountId: string
  ): boolean {
    const isRequester = request.getRequesterId().getValue() === accountId
    const isAssignee = request.getAssigneeId()?.getValue() === accountId
    const isAdmin = account.isAdmin()
    return isRequester || isAssignee || isAdmin
  }

  private buildStorageKey(requestId: string, fileName: string): string {
    return `attachments/${requestId}/${Date.now()}_${fileName}`
  }
}
