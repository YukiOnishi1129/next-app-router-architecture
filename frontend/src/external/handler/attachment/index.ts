"use server";

export { createAttachmentAction } from "./command.action";

export {
  listAttachmentsAction,
  getAttachmentContentAction,
} from "./query.action";

export { createAttachmentServer } from "./command.server";

export {
  listAttachmentsServer,
  getAttachmentContentServer,
} from "./query.server";

// Backwards-compatible aliases
export {
  createAttachmentAction as uploadAttachment,
  deleteAttachmentAction as deleteAttachment,
  createAttachmentAction as uploadAttachmentAction,
  deleteAttachmentAction as deleteAttachmentAction,
} from "./command.action";

export {
  listAttachmentsAction as getAttachments,
  getAttachmentContentAction as downloadAttachment,
  listAttachmentsAction as getAttachmentsAction,
  getAttachmentContentAction as downloadAttachmentAction,
} from "./query.action";

export {
  createAttachmentServer as uploadAttachmentServer,
  deleteAttachmentServer as deleteAttachmentServer,
} from "./command.server";

export {
  listAttachmentsServer as getAttachmentsServer,
  getAttachmentContentServer as downloadAttachmentServer,
} from "./query.server";

export type {
  CreateAttachmentInput,
  CreateAttachmentResponse,
  DeleteAttachmentInput,
  DeleteAttachmentResponse,
} from "./command.server";

export type {
  ListAttachmentsInput,
  ListAttachmentsResponse,
  GetAttachmentContentResponse,
} from "./query.server";

import type { CreateAttachmentResponse } from "./command.server";
import type { ListAttachmentsResponse } from "./query.server";

export type AttachmentResponse = CreateAttachmentResponse;
export type AttachmentListResponse = ListAttachmentsResponse;
