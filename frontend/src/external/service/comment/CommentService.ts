import {
  Comment,
  CommentId,
  Request,
  RequestId,
  Account,
  AccountId,
} from '@/external/domain'
import {
  CommentRepository,
  RequestRepository,
  AccountRepository,
} from '@/external/repository'

import { AuditService } from '../audit/AuditService'
import { NotificationService } from '../notification/NotificationService'

import type { AuditContext } from '../audit/AuditService'

interface CommentContext {
  requestId: string
  content: string
  authorId: string
  parentId?: string
  context?: AuditContext
}

interface UpdateCommentContext {
  commentId: string
  content: string
  accountId: string
  context?: AuditContext
}

interface DeleteCommentContext {
  commentId: string
  accountId: string
  context?: AuditContext
}

interface GetCommentsContext {
  requestId: string
  accountId: string
  limit?: number
  offset?: number
}

export class CommentService {
  private commentRepository: CommentRepository
  private requestRepository: RequestRepository
  private userRepository: AccountRepository

  constructor(
    private notificationService: NotificationService = new NotificationService(),
    private auditService: AuditService = new AuditService()
  ) {
    this.commentRepository = new CommentRepository()
    this.requestRepository = new RequestRepository()
    this.userRepository = new AccountRepository()
  }

  /**
   * Add a comment to a request
   */
  async addComment(params: CommentContext): Promise<Comment> {
    const { requestId, content, authorId, parentId, context } = params
    const [request, author] = await Promise.all([
      this.findRequest(requestId),
      this.findAccount(authorId),
    ])

    this.ensureCanCollaborate(request, author)

    const additionalRecipients: string[] = []

    if (parentId) {
      try {
        const parentComment = await this.findComment(parentId)
        const parentAuthorId = parentComment.getAuthorId().getValue()
        if (parentAuthorId !== authorId) {
          additionalRecipients.push(parentAuthorId)
        }
      } catch {
        // Ignore missing parent comments for backward compatibility
      }
    }

    const comment = Comment.create({
      requestId,
      content,
      authorId,
    })

    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: 'comment.create',
        entityType: 'COMMENT',
        entityId: comment.getId().getValue(),
        accountId: authorId,
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
    ])

    return comment
  }

  /**
   * Update existing comment content
   */
  async updateComment(params: UpdateCommentContext): Promise<Comment> {
    const { commentId, content, accountId, context } = params
    const comment = await this.findComment(commentId)

    if (!comment.canEdit(accountId)) {
      throw new Error('Only the author can update this comment')
    }

    comment.edit(content, accountId)
    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: 'comment.update',
        entityType: 'COMMENT',
        entityId: comment.getId().getValue(),
        accountId,
        metadata: {
          requestId: comment.getRequestId().getValue(),
        },
        context,
      }),
    ])

    return comment
  }

  /**
   * Delete comment (author or admin)
   */
  async deleteComment(params: DeleteCommentContext): Promise<void> {
    const { commentId, accountId, context } = params
    const [comment, account] = await Promise.all([
      this.findComment(commentId),
      this.findAccount(accountId),
    ])

    if (!comment.canDelete(accountId, account.isAdmin())) {
      throw new Error('Only the author or an admin can delete this comment')
    }

    comment.delete(accountId, account.isAdmin())
    await Promise.all([
      this.commentRepository.save(comment),
      this.auditService.logAction({
        action: 'comment.delete',
        entityType: 'COMMENT',
        entityId: comment.getId().getValue(),
        accountId,
        metadata: {
          requestId: comment.getRequestId().getValue(),
          deletedByAdmin:
            account.isAdmin() && comment.getAuthorId().getValue() !== accountId,
        },
        context,
      }),
    ])
  }

  /**
   * Retrieve comments for a request with access checks
   */
  async getComments(params: GetCommentsContext): Promise<{
    comments: Comment[]
    total: number
    limit: number
    offset: number
  }> {
    const { requestId, accountId, limit, offset } = params
    const [request, account] = await Promise.all([
      this.findRequest(requestId),
      this.findAccount(accountId),
    ])

    this.ensureCanView(request, account)

    const [comments, total] = await Promise.all([
      this.commentRepository.findByRequestId(
        RequestId.create(requestId),
        limit,
        offset
      ),
      this.commentRepository.countByRequestId(RequestId.create(requestId)),
    ])

    return {
      comments,
      total,
      limit: limit ?? total,
      offset: offset ?? 0,
    }
  }

  /**
   * Retrieve single comment ensuring the viewer has access to the request
   * Returns as a list to keep compatibility with thread-style responses
   */
  async getCommentThread(
    commentId: string,
    accountId: string
  ): Promise<{
    comments: Comment[]
  }> {
    const comment = await this.findComment(commentId)
    const [request, account] = await Promise.all([
      this.findRequest(comment.getRequestId().getValue()),
      this.findAccount(accountId),
    ])

    this.ensureCanView(request, account)

    return {
      comments: [comment],
    }
  }

  private async findRequest(requestId: string): Promise<Request> {
    const request = await this.requestRepository.findById(
      RequestId.create(requestId)
    )
    if (!request) {
      throw new Error('Request not found')
    }
    return request
  }

  private async findComment(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(
      CommentId.create(commentId)
    )
    if (!comment || comment.isDeleted()) {
      throw new Error('Comment not found')
    }
    return comment
  }

  private async findAccount(accountId: string): Promise<Account> {
    const account = await this.userRepository.findById(
      AccountId.create(accountId)
    )
    if (!account) {
      throw new Error('Account not found')
    }
    return account
  }

  private ensureCanCollaborate(request: Request, account: Account): void {
    if (request.getRequesterId().getValue() === account.getId().getValue()) {
      return
    }
    if (request.getAssigneeId()?.getValue() === account.getId().getValue()) {
      return
    }
    if (account.isAdmin()) {
      return
    }
    throw new Error('Unauthorized')
  }

  private ensureCanView(request: Request, account: Account): void {
    if (request.getRequesterId().getValue() === account.getId().getValue()) {
      return
    }
    if (request.getAssigneeId()?.getValue() === account.getId().getValue()) {
      return
    }
    if (account.isAdmin()) {
      return
    }
    throw new Error('Unauthorized')
  }
}
