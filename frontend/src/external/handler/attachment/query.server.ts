import "server-only";

import { z } from "zod";

import { attachmentService, mapAttachmentToDto } from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { AttachmentDto } from "./shared";

const listAttachmentsSchema = z.object({
  requestId: z.string(),
});

export type ListAttachmentsInput = z.input<typeof listAttachmentsSchema>;

export type ListAttachmentsResponse = {
  success: boolean;
  error?: string;
  attachments?: AttachmentDto[];
  total?: number;
};

export type GetAttachmentContentResponse = {
  success: boolean;
  error?: string;
  data?: string;
  fileName?: string;
  mimeType?: string;
};

export async function listAttachmentsServer(
  data: ListAttachmentsInput
): Promise<ListAttachmentsResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = listAttachmentsSchema.parse(data);

    const attachments = await attachmentService.getAttachments({
      requestId: validated.requestId,
      userId: session.user.id,
    });

    return {
      success: true,
      attachments: attachments.map(mapAttachmentToDto),
      total: attachments.length,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to list attachments",
    };
  }
}

export async function getAttachmentContentServer(
  attachmentId: string
): Promise<GetAttachmentContentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, attachment } = await attachmentService.downloadAttachment({
      attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-query",
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
          : "Failed to get attachment content",
    };
  }
}
