import {
  Comment,
  CommentId,
  Request,
  RequestId,
  User,
  UserId,
} from "@/external/domain";
import {
  CommentRepository,
  RequestRepository,
  UserRepository,
} from "@/external/repository";

import { AuditService } from "../audit/AuditService";
import { NotificationService } from "../notification/NotificationService";

import type { AuditContext } from "../audit/AuditService";

interface CommentContext {
  requestId: string;
  content: string;
  authorId: string;
  parentId?: string;
  context?: AuditContext;
}

interface UpdateCommentContext {
  commentId: string;
  content: string;
  userId: string;
  context?: AuditContext;
}

interface DeleteCommentContext {
  commentId: string;
  userId: string;
  context?: AuditContext;
}

interface GetCommentsContext {
  requestId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

export class CommentService {
  private commentRepository: CommentRepository;
  private requestRepository: RequestRepository;
  private userRepository: UserRepository;

  constructor(
    private notificationService: NotificationService = new NotificationService(),
    private auditService: AuditService = new AuditService()
  ) {
    this.commentRepository = new CommentRepository();
    this.requestRepository = new RequestRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Add a comment to a request
   */
  async addComment(params: CommentContext): Promise<Comment> {
    const { requestId, content, authorId, parentId, context } = params;
    const [request, author] = await Promise.all([
      this.findRequest(requestId),
      this.findUser(authorId),
    ]);

    this.ensureCanCollaborate(request, author);

    const additionalRecipients: string[] = [];

    if (parentId) {
      try {
        const parentComment = await this.findComment(parentId);
        const parentAuthorId = parentComment.getAuthorId().getValue();
        if (parentAuthorId !== authorId) {
          additionalRecipients.push(parentAuthorId);
        }
      } catch {
        // Ignore missing parent comments for backward compatibility
      }
    }

    const comment = Comment.create({
      requestId,
      content,
      authorId,
    });

    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: "comment.create",
        entityType: "COMMENT",
        entityId: comment.getId().getValue(),
        userId: authorId,
        metadata: {
          requestId,
          parentId,
        },
        context,
      }),
      this.notificationService.notifyCommentAdded(
        request,
        comment,
        author,
        additionalRecipients
      ),
    ]);

    return comment;
  }

  /**
   * Update existing comment content
   */
  async updateComment(params: UpdateCommentContext): Promise<Comment> {
    const { commentId, content, userId, context } = params;
    const comment = await this.findComment(commentId);

    if (!comment.canEdit(userId)) {
      throw new Error("Only the author can update this comment");
    }

    comment.edit(content, userId);
    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: "comment.update",
        entityType: "COMMENT",
        entityId: comment.getId().getValue(),
        userId,
        metadata: {
          requestId: comment.getRequestId().getValue(),
        },
        context,
      }),
    ]);

    return comment;
  }

  /**
   * Delete comment (author or admin)
   */
  async deleteComment(params: DeleteCommentContext): Promise<void> {
    const { commentId, userId, context } = params;
    const [comment, user] = await Promise.all([
      this.findComment(commentId),
      this.findUser(userId),
    ]);

    if (!comment.canDelete(userId, user.isAdmin())) {
      throw new Error("Only the author or an admin can delete this comment");
    }

    comment.delete(userId, user.isAdmin());
    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: "comment.delete",
        entityType: "COMMENT",
        entityId: comment.getId().getValue(),
        userId,
        metadata: {
          requestId: comment.getRequestId().getValue(),
          deletedByAdmin:
            user.isAdmin() && comment.getAuthorId().getValue() !== userId,
        },
        context,
      }),
    ]);
  }

  /**
   * Retrieve comments for a request with access checks
   */
  async getComments(params: GetCommentsContext): Promise<{
    comments: Comment[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { requestId, userId, limit, offset } = params;
    const [request, user] = await Promise.all([
      this.findRequest(requestId),
      this.findUser(userId),
    ]);

    this.ensureCanView(request, user);

    const [comments, total] = await Promise.all([
      this.commentRepository.findByRequestId(
        RequestId.create(requestId),
        limit,
        offset
      ),
      this.commentRepository.countByRequestId(RequestId.create(requestId)),
    ]);

    return {
      comments,
      total,
      limit: limit ?? total,
      offset: offset ?? 0,
    };
  }

  /**
   * Retrieve single comment ensuring the viewer has access to the request
   * Returns as a list to keep compatibility with thread-style responses
   */
  async getCommentThread(
    commentId: string,
    userId: string
  ): Promise<{
    comments: Comment[];
  }> {
    const comment = await this.findComment(commentId);
    const [request, user] = await Promise.all([
      this.findRequest(comment.getRequestId().getValue()),
      this.findUser(userId),
    ]);

    this.ensureCanView(request, user);

    return {
      comments: [comment],
    };
  }

  private async findRequest(requestId: string): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    );
    if (!request) {
      throw new Error("Request not found");
    }
    return request;
  }

  private async findComment(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(
      CommentId.create(commentId)
    );
    if (!comment || comment.isDeleted()) {
      throw new Error("Comment not found");
    }
    return comment;
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  private ensureCanCollaborate(request: Request, user: User): void {
    if (request.getRequesterId().getValue() === user.getId().getValue()) {
      return;
    }
    if (request.getAssigneeId()?.getValue() === user.getId().getValue()) {
      return;
    }
    if (user.isAdmin()) {
      return;
    }
    throw new Error("Unauthorized");
  }

  private ensureCanView(request: Request, user: User): void {
    if (request.getRequesterId().getValue() === user.getId().getValue()) {
      return;
    }
    if (request.getAssigneeId()?.getValue() === user.getId().getValue()) {
      return;
    }
    if (user.isAdmin()) {
      return;
    }
    throw new Error("Unauthorized");
  }
}
