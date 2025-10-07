"use server";

import { z } from "zod";
import { Attachment } from "@/external/domain/attachment";
import { AttachmentService } from "@/external/service/AttachmentService";
import { getSession } from "./auth";

// Validation schemas
const uploadAttachmentSchema = z.object({
  requestId: z.string(),
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .min(1)
    .max(10 * 1024 * 1024), // Max 10MB
  mimeType: z.string(),
  data: z.string(), // Base64 encoded
});

const deleteAttachmentSchema = z.object({
  attachmentId: z.string(),
});

const getAttachmentsSchema = z.object({
  requestId: z.string(),
});

type UploadAttachmentInput = z.input<typeof uploadAttachmentSchema>;
type DeleteAttachmentInput = z.input<typeof deleteAttachmentSchema>;
type GetAttachmentsInput = z.input<typeof getAttachmentsSchema>;

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
  attachments?: Array<AttachmentResponse["attachment"]>;
  total?: number;
};

// Initialize services
const attachmentService = new AttachmentService();

/**
 * Upload attachment to a request
 */
export async function uploadAttachment(
  data: UploadAttachmentInput
): Promise<AttachmentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = uploadAttachmentSchema.parse(data);

    const attachment = await attachmentService.uploadAttachment({
      requestId: validated.requestId,
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
      data: validated.data,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      attachment: buildAttachmentResponse(attachment),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload attachment",
    };
  }
}

/**
 * Delete attachment
 */
export async function deleteAttachment(
  data: DeleteAttachmentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = deleteAttachmentSchema.parse(data);

    await attachmentService.deleteAttachment({
      attachmentId: validated.attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete attachment",
    };
  }
}

/**
 * Get attachments for a request
 */
export async function getAttachments(
  data: GetAttachmentsInput
): Promise<AttachmentListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = getAttachmentsSchema.parse(data);

    const attachments = await attachmentService.getAttachments({
      requestId: validated.requestId,
      userId: session.user.id,
    });

    return {
      success: true,
      attachments: attachments.map((attachment) =>
        buildAttachmentResponse(attachment)
      ),
      total: attachments.length,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get attachments",
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
        error: "Unauthorized",
      };
    }

    const { data, attachment } = await attachmentService.downloadAttachment({
      attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      data,
      fileName: attachment.getFileName(),
      mimeType: attachment.getMimeType(),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to download attachment",
    };
  }
}

function buildAttachmentResponse(
  attachment: Attachment
): AttachmentResponse["attachment"] {
  const json = attachment.toJSON();
  return {
    id: json.id,
    fileName: json.fileName,
    fileSize: json.size.bytes,
    mimeType: json.mimeType,
    uploadedBy: json.uploadedById,
    requestId: json.requestId,
    createdAt: json.uploadedAt,
    url: `/api/attachments/${json.id}/download`,
  };
}
