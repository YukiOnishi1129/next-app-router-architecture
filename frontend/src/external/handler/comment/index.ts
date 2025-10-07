"use server";

export {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from "./command.action";

export { listCommentsAction } from "./query.action";

export {
  createCommentServer,
  updateCommentServer,
  deleteCommentServer,
} from "./command.server";

export { listCommentsServer } from "./query.server";

// Backwards-compatible aliases (legacy names)
export {
  createCommentAction as addComment,
  updateCommentAction as updateComment,
  deleteCommentAction as deleteComment,
} from "./command.action";

export {
  listCommentsAction as getComments,
  getCommentThreadAction as getCommentThread,
} from "./query.action";

export {
  createCommentAction as addCommentAction,
  updateCommentAction as updateCommentActionLegacy,
  deleteCommentAction as deleteCommentActionLegacy,
} from "./command.action";

export {
  listCommentsAction as getCommentsAction,
  getCommentThreadAction as getCommentThreadAction,
} from "./query.action";

export {
  createCommentServer as addCommentServer,
  updateCommentServer as updateCommentServerLegacy,
  deleteCommentServer as deleteCommentServerLegacy,
} from "./command.server";

export {
  listCommentsServer as getCommentsServer,
  getCommentThreadServer as getCommentThreadServer,
} from "./query.server";

export type {
  CreateCommentInput,
  CreateCommentResponse,
  UpdateCommentInput,
  UpdateCommentResponse,
  DeleteCommentInput,
  DeleteCommentResponse,
} from "./command.server";

export type {
  ListCommentsInput,
  ListCommentsResponse,
  GetCommentThreadResponse,
} from "./query.server";

import type { CreateCommentResponse } from "./command.server";
import type { ListCommentsResponse } from "./query.server";

export type CommentResponse = CreateCommentResponse;
export type CommentListResponse = ListCommentsResponse;
