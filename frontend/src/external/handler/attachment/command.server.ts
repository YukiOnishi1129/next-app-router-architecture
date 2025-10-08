import "server-only";

import { z } from "zod";

import { attachmentService, mapAttachmentToDto } from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { AttachmentDto } from "./shared";

const createAttachmentSchema = z.object({
  requestId: z.string(),
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .min(1)
    .max(10 * 1024 * 1024),
  mimeType: z.string(),
  data: z.string(),
});

const deleteAttachmentSchema = z.object({
  attachmentId: z.string(),
});

export type CreateAttachmentInput = z.input<typeof createAttachmentSchema>;
export type DeleteAttachmentInput = z.input<typeof deleteAttachmentSchema>;

export type CreateAttachmentResponse = {
  success: boolean;
  error?: string;
  attachment?: AttachmentDto;
};

export type DeleteAttachmentResponse = {
  success: boolean;
  error?: string;
};

export async function createAttachmentServer(
  data: CreateAttachmentInput
): Promise<CreateAttachmentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createAttachmentSchema.parse(data);

    const attachment = await attachmentService.uploadAttachment({
      requestId: validated.requestId,
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
      data: validated.data,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-command",
      },
    });

    return {
      success: true,
      attachment: mapAttachmentToDto(attachment),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create attachment",
    };
  }
}

export async function deleteAttachmentServer(
  data: DeleteAttachmentInput
): Promise<DeleteAttachmentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = deleteAttachmentSchema.parse(data);

    await attachmentService.deleteAttachment({
      attachmentId: validated.attachmentId,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-command",
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete attachment",
    };
  }
}
