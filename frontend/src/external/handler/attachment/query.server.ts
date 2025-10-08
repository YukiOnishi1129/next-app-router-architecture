import 'server-only'

import { ZodError } from 'zod'

import { listAttachmentsSchema } from '@/external/dto/attachment'

import { attachmentService, mapAttachmentToDto } from './shared'
import { getSessionServer } from '../auth/query.server'

import type {
  ListAttachmentsInput,
  ListAttachmentsResponse,
  GetAttachmentContentResponse,
} from '@/external/dto/attachment'

export async function listAttachmentsServer(
  data: ListAttachmentsInput
): Promise<ListAttachmentsResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = listAttachmentsSchema.parse(data)

    const attachments = await attachmentService.getAttachments({
      requestId: validated.requestId,
      userId: session.user.id,
    })

    return {
      success: true,
      attachments: attachments.map(mapAttachmentToDto),
      total: attachments.length,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list attachments',
    }
  }
}

export async function getAttachmentContentServer(
  attachmentId: string
): Promise<GetAttachmentContentResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data, attachment } = await attachmentService.downloadAttachment({
      attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: 'server',
        userAgent: 'server-query',
      },
    })

    return {
      success: true,
      data,
      fileName: attachment.getFileName(),
      mimeType: attachment.getMimeType(),
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to get attachment content',
    }
  }
}

export type {
  ListAttachmentsInput,
  ListAttachmentsResponse,
  GetAttachmentContentResponse,
} from '@/external/dto/attachment'
