import { z } from 'zod'

import type { AttachmentDto } from './attachment.dto'

export const createAttachmentSchema = z.object({
  requestId: z.string(),
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .min(1)
    .max(10 * 1024 * 1024),
  mimeType: z.string(),
  data: z.string(),
})

export const deleteAttachmentSchema = z.object({
  attachmentId: z.string(),
})

export type CreateAttachmentInput = z.input<typeof createAttachmentSchema>
export type DeleteAttachmentInput = z.input<typeof deleteAttachmentSchema>

export type CreateAttachmentResponse = {
  success: boolean
  error?: string
  attachment?: AttachmentDto
}

export type DeleteAttachmentResponse = {
  success: boolean
  error?: string
}
