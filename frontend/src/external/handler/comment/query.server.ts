import "server-only";

import { z } from "zod";
import { getSessionServer } from "../auth/query.server";
import { commentService, mapCommentToDto, type CommentDto } from "./shared";

const listCommentsSchema = z.object({
  requestId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type ListCommentsInput = z.input<typeof listCommentsSchema>;

export type ListCommentsResponse = {
  success: boolean;
  error?: string;
  comments?: CommentDto[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type GetCommentThreadResponse = {
  success: boolean;
  error?: string;
  comments?: CommentDto[];
  total?: number;
};

export async function listCommentsServer(
  data: ListCommentsInput
): Promise<ListCommentsResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = listCommentsSchema.parse(data);

    const result = await commentService.getComments({
      requestId: validated.requestId,
      userId: session.user.id,
      limit: validated.limit,
      offset: validated.offset,
    });

    return {
      success: true,
      comments: result.comments.map((comment) => mapCommentToDto(comment)),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list comments",
    };
  }
}

export async function getCommentThreadServer(
  commentId: string
): Promise<GetCommentThreadResponse> {
  try {
    const session = await getSessionServer();
    if (!session.isAuthenticated || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await commentService.getCommentThread(
      commentId,
      session.user.id
    );

    return {
      success: true,
      comments: result.comments.map((comment) => mapCommentToDto(comment)),
      total: result.comments.length,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get comment thread",
    };
  }
}
