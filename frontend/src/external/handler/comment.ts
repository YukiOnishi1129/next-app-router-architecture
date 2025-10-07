"use server";

import { z } from "zod";
import { CommentService } from "@/external/service";
import { getSession } from "./auth";

// Validation schemas
const addCommentSchema = z.object({
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

const getCommentsSchema = z.object({
  requestId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

type AddCommentInput = z.input<typeof addCommentSchema>;
type UpdateCommentInput = z.input<typeof updateCommentSchema>;
type DeleteCommentInput = z.input<typeof deleteCommentSchema>;
type GetCommentsInput = z.input<typeof getCommentsSchema>;

// Response types
export type CommentResponse = {
  success: boolean;
  error?: string;
  comment?: {
    id: string;
    content: string;
    requestId: string;
    authorId: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
  };
};

export type CommentListResponse = {
  success: boolean;
  error?: string;
  comments?: Array<CommentResponse["comment"]>;
  total?: number;
  limit?: number;
  offset?: number;
};

// Initialize services
const commentService = new CommentService();

/**
 * Add a comment to a request
 */
export async function addComment(
  data: AddCommentInput
): Promise<CommentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = addCommentSchema.parse(data);

    const comment = await commentService.addComment({
      requestId: validated.requestId,
      content: validated.content,
      authorId: session.user.id,
      parentId: validated.parentId,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      comment: {
        id: comment.getId().getValue(),
        content: comment.getContent().getValue(),
        requestId: comment.getRequestId().getValue(),
        authorId: comment.getAuthorId().getValue(),
        createdAt: comment.getCreatedAt().toISOString(),
        updatedAt: comment.getUpdatedAt().toISOString(),
        isEdited: comment.isEdited(),
      },
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
      error: error instanceof Error ? error.message : "Failed to add comment",
    };
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  data: UpdateCommentInput
): Promise<CommentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateCommentSchema.parse(data);
    const comment = await commentService.updateComment({
      commentId: validated.commentId,
      content: validated.content,
      userId: session.user.id,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      comment: {
        id: comment.getId().getValue(),
        content: comment.getContent().getValue(),
        requestId: comment.getRequestId().getValue(),
        authorId: comment.getAuthorId().getValue(),
        createdAt: comment.getCreatedAt().toISOString(),
        updatedAt: comment.getUpdatedAt().toISOString(),
        isEdited: comment.isEdited(),
      },
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
        error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(
  data: DeleteCommentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = deleteCommentSchema.parse(data);

    await commentService.deleteComment({
      commentId: validated.commentId,
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
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

/**
 * Get comments for a request
 */
export async function getComments(
  data: GetCommentsInput
): Promise<CommentListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = getCommentsSchema.parse(data);

    const result = await commentService.getComments({
      requestId: validated.requestId,
      userId: session.user.id,
      limit: validated.limit,
      offset: validated.offset,
    });

    return {
      success: true,
      comments: result.comments.map((c) => ({
        id: c.getId().getValue(),
        content: c.getContent().getValue(),
        requestId: c.getRequestId().getValue(),
        authorId: c.getAuthorId().getValue(),
        createdAt: c.getCreatedAt().toISOString(),
        updatedAt: c.getUpdatedAt().toISOString(),
        isEdited: c.isEdited(),
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
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
      error: error instanceof Error ? error.message : "Failed to get comments",
    };
  }
}

/**
 * Get comment thread (comment with its replies)
 */
export async function getCommentThread(
  commentId: string
): Promise<CommentListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const result = await commentService.getCommentThread(
      commentId,
      session.user.id
    );

    return {
      success: true,
      comments: result.comments.map((c) => ({
        id: c.getId().getValue(),
        content: c.getContent().getValue(),
        requestId: c.getRequestId().getValue(),
        authorId: c.getAuthorId().getValue(),
        createdAt: c.getCreatedAt().toISOString(),
        updatedAt: c.getUpdatedAt().toISOString(),
        isEdited: c.isEdited(),
      })),
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
