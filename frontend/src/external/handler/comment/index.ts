'use server'

import type { CreateCommentResponse } from './command.server'
import type { ListCommentsResponse } from '@/external/dto/comment'

export {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from './command.action'

export { listCommentsAction, getCommentThreadAction } from './query.action'

export {
  createCommentServer,
  updateCommentServer,
  deleteCommentServer,
} from './command.server'

export { listCommentsServer, getCommentThreadServer } from './query.server'

// Backwards-compatible aliases (legacy names)
export {
  createCommentAction as addComment,
  updateCommentAction as updateComment,
  deleteCommentAction as deleteComment,
} from './command.action'

export {
  listCommentsAction as getComments,
  getCommentThreadAction as getCommentThread,
} from './query.action'

export {
  createCommentAction as addCommentAction,
  updateCommentAction as updateCommentActionLegacy,
  deleteCommentAction as deleteCommentActionLegacy,
} from './command.action'

export { listCommentsAction as getCommentsAction } from './query.action'

export {
  createCommentServer as addCommentServer,
  updateCommentServer as updateCommentServerLegacy,
  deleteCommentServer as deleteCommentServerLegacy,
} from './command.server'

export { listCommentsServer as getCommentsServer } from './query.server'

export type {
  CreateCommentInput,
  UpdateCommentInput,
  UpdateCommentResponse,
  DeleteCommentInput,
  DeleteCommentResponse,
} from './command.server'

export type {
  ListCommentsInput,
  GetCommentThreadResponse,
} from './query.server'

export type CommentResponse = CreateCommentResponse
export type CommentListResponse = ListCommentsResponse
