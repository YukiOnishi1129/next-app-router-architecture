import 'server-only'

import { ZodError } from 'zod'

import {
  createAttachmentSchema,
  deleteAttachmentSchema,
} from '@/external/dto/attachment'

import { attachmentService, mapAttachmentToDto } from './shared'
import { getSessionServer } from '../auth/query.server'

import type {
  CreateAttachmentInput,
  DeleteAttachmentInput,
  CreateAttachmentResponse,
  DeleteAttachmentResponse,
} from '@/external/dto/attachment'

export async function createAttachmentServer(
  data: CreateAttachmentInput
): Promise<CreateAttachmentResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = createAttachmentSchema.parse(data)

    const attachment = await attachmentService.uploadAttachment({
      requestId: validated.requestId,
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
      data: validated.data,
      userId: session.user.id,
      context: {
        ipAddress: 'server',
        userAgent: 'server-command',
      },
    })

    return {
      success: true,
      attachment: mapAttachmentToDto(attachment),
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create attachment',
    }
  }
}

export async function deleteAttachmentServer(
  data: DeleteAttachmentInput
): Promise<DeleteAttachmentResponse> {
  try {
    const session = await getSessionServer()
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = deleteAttachmentSchema.parse(data)

    await attachmentService.deleteAttachment({
      attachmentId: validated.attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: 'server',
        userAgent: 'server-command',
      },
    })

    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete attachment',
    }
  }
}

export type {
  CreateAttachmentInput,
  DeleteAttachmentInput,
  CreateAttachmentResponse,
  DeleteAttachmentResponse,
} from '@/external/dto/attachment'
