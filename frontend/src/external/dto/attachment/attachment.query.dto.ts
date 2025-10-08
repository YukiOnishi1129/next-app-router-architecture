import { z } from 'zod'

import type { AttachmentDto } from './attachment.dto'

export const listAttachmentsSchema = z.object({
  requestId: z.string(),
})

export type ListAttachmentsInput = z.input<typeof listAttachmentsSchema>

export type ListAttachmentsResponse = {
  success: boolean
  error?: string
  attachments?: AttachmentDto[]
  total?: number
}

export type GetAttachmentContentResponse = {
  success: boolean
  error?: string
  data?: string
  fileName?: string
  mimeType?: string
}
