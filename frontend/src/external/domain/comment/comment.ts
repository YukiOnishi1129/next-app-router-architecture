import { AccountId } from '../account'
import { RequestId } from '../request'
import { CommentId } from './comment-id'

/**
 * CommentContent value object
 */
export class CommentContent {
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 2000

  constructor(private readonly value: string) {
    this.validate(value)
  }

  private validate(value: string): void {
    if (!value || value.trim().length < CommentContent.MIN_LENGTH) {
      throw new Error(
        `Comment must be at least ${CommentContent.MIN_LENGTH} character`
      )
    }
    if (value.length > CommentContent.MAX_LENGTH) {
      throw new Error(
        `Comment cannot exceed ${CommentContent.MAX_LENGTH} characters`
      )
    }
  }

  getValue(): string {
    return this.value
  }

  getLength(): number {
    return this.value.length
  }

  equals(other: CommentContent): boolean {
    return this.value === other.value
  }
}

/**
 * Comment entity - represents a comment on a request
 */
export class Comment {
  private constructor(
    private readonly id: CommentId,
    private readonly requestId: RequestId,
    private content: CommentContent,
    private readonly authorId: AccountId,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private edited: boolean,
    private deleted: boolean,
    private deletedAt: Date | null
  ) {}

  static create(params: {
    requestId: string
    content: string
    authorId: string
  }): Comment {
    const now = new Date()
    return new Comment(
      CommentId.generate(),
      RequestId.create(params.requestId),
      new CommentContent(params.content),
      AccountId.create(params.authorId),
      now,
      now,
      false,
      false,
      null
    )
  }

  static restore(params: {
    id: string
    requestId: string
    content: string
    authorId: string
    createdAt: Date
    updatedAt: Date
    edited: boolean
    deleted: boolean
    deletedAt: Date | null
  }): Comment {
    return new Comment(
      CommentId.create(params.id),
      RequestId.create(params.requestId),
      new CommentContent(params.content),
      AccountId.create(params.authorId),
      params.createdAt,
      params.updatedAt,
      params.edited,
      params.deleted,
      params.deletedAt
    )
  }

  getId(): CommentId {
    return this.id
  }

  getRequestId(): RequestId {
    return this.requestId
  }

  getContent(): CommentContent {
    return this.content
  }

  getAuthorId(): AccountId {
    return this.authorId
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt)
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt)
  }

  isEdited(): boolean {
    return this.edited
  }

  isDeleted(): boolean {
    return this.deleted
  }

  getDeletedAt(): Date | null {
    return this.deletedAt ? new Date(this.deletedAt) : null
  }

  canEdit(accountId: string): boolean {
    return !this.deleted && this.authorId.getValue() === accountId
  }

  canDelete(accountId: string, isAdmin: boolean): boolean {
    return !this.deleted && (this.authorId.getValue() === accountId || isAdmin)
  }

  edit(newContent: string, editorId: string): void {
    if (this.deleted) {
      throw new Error('Cannot edit deleted comment')
    }
    if (this.authorId.getValue() !== editorId) {
      throw new Error('Only the author can edit their comment')
    }
    this.content = new CommentContent(newContent)
    this.edited = true
    this.updatedAt = new Date()
  }

  delete(deleterId: string, isDeleterAdmin: boolean): void {
    if (this.deleted) {
      throw new Error('Comment is already deleted')
    }
    if (this.authorId.getValue() !== deleterId && !isDeleterAdmin) {
      throw new Error('Only the author or an admin can delete a comment')
    }
    this.deleted = true
    this.deletedAt = new Date()
    this.updatedAt = new Date()
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      requestId: this.requestId.getValue(),
      content: this.content.getValue(),
      authorId: this.authorId.getValue(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      edited: this.edited,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString() || null,
    }
  }
}
