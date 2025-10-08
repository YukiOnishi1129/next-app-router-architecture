import "server-only";

import { z } from "zod";

import { commentService, mapCommentToDto } from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { CommentDto } from "./shared";

const createCommentSchema = z.object({
  requestId: z.string(),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  commentId: z.string(),
  content: z.string().min(1).max(2000),
});

const deleteCommentSchema = z.object({
  commentId: z.string(),
});

export type CreateCommentInput = z.input<typeof createCommentSchema>;
export type UpdateCommentInput = z.input<typeof updateCommentSchema>;
export type DeleteCommentInput = z.input<typeof deleteCommentSchema>;

export type CreateCommentResponse = {
  success: boolean;
  error?: string;
  comment?: CommentDto;
};

export type UpdateCommentResponse = CreateCommentResponse;

export type DeleteCommentResponse = {
  success: boolean;
  error?: string;
};

export async function createCommentServer(
  data: CreateCommentInput
): Promise<CreateCommentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createCommentSchema.parse(data);

    const comment = await commentService.addComment({
      requestId: validated.requestId,
      content: validated.content,
      authorId: session.user.id,
      parentId: validated.parentId,
      context: {
        ipAddress: "server",
        userAgent: "server-command",
      },
    });

    return {
      success: true,
      comment: mapCommentToDto(comment, validated.parentId),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function updateCommentServer(
  data: UpdateCommentInput
): Promise<UpdateCommentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateCommentSchema.parse(data);

    const comment = await commentService.updateComment({
      commentId: validated.commentId,
      content: validated.content,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-command",
      },
    });

    return {
      success: true,
      comment: mapCommentToDto(comment),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}

export async function deleteCommentServer(
  data: DeleteCommentInput
): Promise<DeleteCommentResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = deleteCommentSchema.parse(data);

    await commentService.deleteComment({
      commentId: validated.commentId,
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
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}
