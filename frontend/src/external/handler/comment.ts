"use server";

import { z } from "zod";
import {
  CommentRepository,
  RequestRepository,
  UserRepository,
} from "@/external/domain";
import { Comment } from "@/external/domain/comment";
import { NotificationService } from "@/external/service/NotificationService";
import { AuditService } from "@/external/service/AuditService";
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
const commentRepository = new CommentRepository();
const requestRepository = new RequestRepository();
const userRepository = new UserRepository();
const notificationService = new NotificationService();
const auditService = new AuditService();

/**
 * Add a comment to a request
 */
export async function addComment(data: unknown): Promise<CommentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = addCommentSchema.parse(data);

    // Verify request exists
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Check if user has permission to comment
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Create comment
    const comment = Comment.create({
      content: validated.content,
      requestId: validated.requestId,
      authorId: session.user.id,
      parentId: validated.parentId,
    });

    await commentRepository.save(comment);

    // Send notifications
    const recipients = new Set<string>();

    // Notify request owner
    recipients.add(request.getRequesterId().getValue());

    // Notify assignee if exists
    const assigneeId = request.getAssigneeId()?.getValue();
    if (assigneeId) {
      recipients.add(assigneeId);
    }

    // If this is a reply, notify the parent comment author
    if (validated.parentId) {
      const parentComment = await commentRepository.findById(
        validated.parentId
      );
      if (parentComment) {
        recipients.add(parentComment.getAuthorId().getValue());
      }
    }

    // Remove self from recipients
    recipients.delete(session.user.id);

    // Send notifications
    for (const recipientId of recipients) {
      const recipient = await userRepository.findById(recipientId);
      if (recipient) {
        await notificationService.notifyNewComment(comment, request, recipient);
      }
    }

    // Log the action
    await auditService.logAction({
      action: "comment.create",
      entityType: "comment",
      entityId: comment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: validated.requestId,
        parentId: validated.parentId,
      },
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      comment: comment.toJSON(),
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
export async function updateComment(data: unknown): Promise<CommentResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateCommentSchema.parse(data);

    const comment = await commentRepository.findById(validated.commentId);
    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Only the author can update their comment
    if (comment.getAuthorId().getValue() !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    comment.updateContent(validated.content);
    await commentRepository.save(comment);

    // Log the action
    await auditService.logAction({
      action: "comment.update",
      entityType: "comment",
      entityId: comment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: comment.getRequestId().getValue(),
      },
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      comment: comment.toJSON(),
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
  data: unknown
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

    const comment = await commentRepository.findById(validated.commentId);
    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Only the author or admin can delete a comment
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const isAuthor = comment.getAuthorId().getValue() === session.user.id;
    const isAdmin = user.isAdmin();

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await commentRepository.delete(validated.commentId);

    // Log the action
    await auditService.logAction({
      action: "comment.delete",
      entityType: "comment",
      entityId: comment.getId().getValue(),
      userId: session.user.id,
      metadata: {
        requestId: comment.getRequestId().getValue(),
        deletedByAdmin: !isAuthor && isAdmin,
      },
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
export async function getComments(data: unknown): Promise<CommentListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = getCommentsSchema.parse(data);

    // Verify request exists and user has access
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Check if user has permission to view this request
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAssignee = request.getAssigneeId()?.getValue() === session.user.id;
    const isAdmin = user.isAdmin();

    if (!isRequester && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get comments
    const allComments = await commentRepository.findByRequestId(
      validated.requestId
    );

    // Sort by creation date (newest first)
    allComments.sort(
      (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime()
    );

    // Apply pagination
    const total = allComments.length;
    const start = validated.offset;
    const end = start + validated.limit;
    const paginatedComments = allComments.slice(start, end);

    return {
      success: true,
      comments: paginatedComments.map((c) => c.toJSON()),
      total,
      limit: validated.limit,
      offset: validated.offset,
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

    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    // Verify request exists and user has access
    const request = await requestRepository.findById(
      comment.getRequestId().getValue()
    );
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Check permissions
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const isRequester = request.getRequesterId().getValue() === session.user.id;
    const isAssignee = request.getAssigneeId()?.getValue() === session.user.id;
    const isAdmin = user.isAdmin();

    if (!isRequester && !isAssignee && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get replies
    const replies = await commentRepository.findReplies(commentId);

    // Sort by creation date (oldest first for thread)
    replies.sort(
      (a, b) => a.getCreatedAt().getTime() - b.getCreatedAt().getTime()
    );

    // Include the parent comment
    const thread = [comment, ...replies];

    return {
      success: true,
      comments: thread.map((c) => c.toJSON()),
      total: thread.length,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get comment thread",
    };
  }
}
