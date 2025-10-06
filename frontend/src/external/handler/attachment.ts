'use server';

import { z } from 'zod';
import { AttachmentRepository, RequestRepository, UserRepository } from '@/external/domain';
import { Attachment } from '@/external/domain/attachment';
import { AuditService } from '@/external/service/AuditService';
import { getSession } from './auth';

// Validation schemas
const uploadAttachmentSchema = z.object({
  requestId: z.string(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(10 * 1024 * 1024), // Max 10MB
  mimeType: z.string(),
  data: z.string(), // Base64 encoded
});

const deleteAttachmentSchema = z.object({
  attachmentId: z.string(),
});

const getAttachmentsSchema = z.object({
  requestId: z.string(),
});

// Response types
export type AttachmentResponse = {
  success: boolean;
  error?: string;
  attachment?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    requestId: string;
    createdAt: string;
    url?: string;
  };
};

export type AttachmentListResponse = {
  success: boolean;
  error?: string;
  attachments?: Array<AttachmentResponse['attachment']>;
  total?: number;
};

// Initialize services
const attachmentRepository = new AttachmentRepository();
const requestRepository = new RequestRepository();
const userRepository = new UserRepository();
const auditService = new AuditService();

// Allowed file types
const ALLOWED_MIME_TYPES = [
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
];

/**
 * Upload attachment to a request
 */
export async function uploadAttachment(data: unknown): Promise<AttachmentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = uploadAttachmentSchema.parse(data);
    
    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(validated.mimeType)) {
      return {
        success: false,
        error: 'File type not allowed',
      };
    }
    
    // Verify request exists
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Check permission to upload
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAssignee = request.getAssigneeId()?.getValue() === session.user.id;
    const isAdmin = user.isAdmin();
    
    if (!isRequester && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Create attachment
    const attachment = Attachment.create({
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
      uploadedBy: session.user.id,
      requestId: validated.requestId,
      storagePath: `attachments/${validated.requestId}/${Date.now()}_${validated.fileName}`,
    });
    
    // In production, save the file to cloud storage (S3, etc.)
    // For now, we'll just save the metadata
    await attachmentRepository.save(attachment);
    
    // Add attachment to request
    request.addAttachment(attachment.getId().getValue());
    await requestRepository.save(request);
    
    // Log the action
    await auditService.logAction({
      action: 'attachment.upload',
      entityType: 'attachment',
      entityId: attachment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: validated.requestId,
        fileName: validated.fileName,
        fileSize: validated.fileSize,
        mimeType: validated.mimeType,
      },
      context: {
        ipAddress: 'server',
        userAgent: 'server-action',
      },
    });
    
    return {
      success: true,
      attachment: {
        ...attachment.toJSON(),
        url: `/api/attachments/${attachment.getId().getValue()}/download`,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload attachment',
    };
  }
}

/**
 * Delete attachment
 */
export async function deleteAttachment(data: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = deleteAttachmentSchema.parse(data);
    
    const attachment = await attachmentRepository.findById(validated.attachmentId);
    if (!attachment) {
      return {
        success: false,
        error: 'Attachment not found',
      };
    }
    
    // Verify request exists
    const request = await requestRepository.findById(attachment.getRequestId().getValue());
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Check permission
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const isUploader = attachment.getUploadedBy().getValue() === session.user.id;
    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAdmin = user.isAdmin();
    
    if (!isUploader && !isRequester && !isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Remove from request
    request.removeAttachment(validated.attachmentId);
    await requestRepository.save(request);
    
    // Delete attachment
    await attachmentRepository.delete(validated.attachmentId);
    
    // In production, also delete from cloud storage
    
    // Log the action
    await auditService.logAction({
      action: 'attachment.delete',
      entityType: 'attachment',
      entityId: attachment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: attachment.getRequestId().getValue(),
        fileName: attachment.getFileName(),
        deletedByAdmin: !isUploader && isAdmin,
      },
      context: {
        ipAddress: 'server',
        userAgent: 'server-action',
      },
    });
    
    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete attachment',
    };
  }
}

/**
 * Get attachments for a request
 */
export async function getAttachments(data: unknown): Promise<AttachmentListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = getAttachmentsSchema.parse(data);
    
    // Verify request exists
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Check permission
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAssignee = request.getAssigneeId()?.getValue() === session.user.id;
    const isAdmin = user.isAdmin();
    
    if (!isRequester && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // Get attachments
    const attachmentIds = request.getAttachmentIds();
    const attachments = await Promise.all(
      attachmentIds.map(id => attachmentRepository.findById(id))
    );
    
    const validAttachments = attachments.filter(a => a !== null) as Attachment[];
    
    return {
      success: true,
      attachments: validAttachments.map(a => ({
        ...a.toJSON(),
        url: `/api/attachments/${a.getId().getValue()}/download`,
      })),
      total: validAttachments.length,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get attachments',
    };
  }
}

/**
 * Download attachment
 */
export async function downloadAttachment(attachmentId: string): Promise<{
  success: boolean;
  error?: string;
  data?: string; // Base64 encoded
  fileName?: string;
  mimeType?: string;
}> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) {
      return {
        success: false,
        error: 'Attachment not found',
      };
    }
    
    // Verify request exists
    const request = await requestRepository.findById(attachment.getRequestId().getValue());
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Check permission
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAssignee = request.getAssigneeId()?.getValue() === session.user.id;
    const isAdmin = user.isAdmin();
    
    if (!isRequester && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    // In production, fetch from cloud storage
    // For now, return mock data
    const mockData = 'SGVsbG8gV29ybGQh'; // "Hello World!" in base64
    
    // Log download
    await auditService.logAction({
      action: 'attachment.download',
      entityType: 'attachment',
      entityId: attachment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: attachment.getRequestId().getValue(),
        fileName: attachment.getFileName(),
      },
      context: {
        ipAddress: 'server',
        userAgent: 'server-action',
      },
    });
    
    return {
      success: true,
      data: mockData,
      fileName: attachment.getFileName(),
      mimeType: attachment.getMimeType(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download attachment',
    };
  }
}