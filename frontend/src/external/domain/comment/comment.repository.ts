import { Comment } from './comment'
import { CommentId } from './comment-id'
import { RequestId } from '../request'
import { Repository } from '../shared/repository'

/**
 * Comment repository interface
 */
export interface CommentRepository extends Repository<Comment, CommentId> {
  findByRequestId(
    requestId: RequestId,
    limit?: number,
    offset?: number
  ): Promise<Comment[]>
  countByRequestId(requestId: RequestId): Promise<number>
}
