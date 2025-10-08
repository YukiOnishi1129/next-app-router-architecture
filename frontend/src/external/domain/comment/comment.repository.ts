import { Repository } from "../shared/repository";
import { Comment } from "./comment";
import { CommentId } from "./comment-id";
import { RequestId } from "../request";

/**
 * Comment repository interface
 */
export interface CommentRepository extends Repository<Comment, CommentId> {
  findByRequestId(
    requestId: RequestId,
    limit?: number,
    offset?: number
  ): Promise<Comment[]>;
  countByRequestId(requestId: RequestId): Promise<number>;
}
