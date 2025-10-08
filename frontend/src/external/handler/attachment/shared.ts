import { Attachment } from '@/external/domain/attachment'
import { AttachmentService } from '@/external/service/attachment/AttachmentService'

import type { AttachmentDto } from '@/external/dto/attachment'

export const attachmentService = new AttachmentService()

export type { AttachmentDto } from '@/external/dto/attachment'

export function mapAttachmentToDto(attachment: Attachment): AttachmentDto {
  const json = attachment.toJSON()
  return {
    id: json.id,
    fileName: json.fileName,
    fileSize: json.size.bytes,
    mimeType: json.mimeType,
    uploadedBy: json.uploadedById,
    requestId: json.requestId,
    createdAt: json.uploadedAt,
    url: `/api/attachments/${json.id}/download`,
  }
}
