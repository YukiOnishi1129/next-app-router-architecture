import { CommentService } from "@/external/service";
import { Comment } from "@/external/domain";

export const commentService = new CommentService();

export type CommentDto = {
  id: string;
  content: string;
  requestId: string;
  authorId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
};

export function mapCommentToDto(
  comment: Comment,
  parentId?: string
): CommentDto {
  const base: CommentDto = {
    id: comment.getId().getValue(),
    content: comment.getContent().getValue(),
    requestId: comment.getRequestId().getValue(),
    authorId: comment.getAuthorId().getValue(),
    createdAt: comment.getCreatedAt().toISOString(),
    updatedAt: comment.getUpdatedAt().toISOString(),
    isEdited: comment.isEdited(),
  };

  if (parentId) {
    return { ...base, parentId };
  }

  const maybeParent = (
    comment as unknown as {
      getParentId?: () => { getValue(): string };
    }
  ).getParentId?.();

  if (maybeParent) {
    return { ...base, parentId: maybeParent.getValue() };
  }

  return base;
}
