"use server";

import {
  getAttachmentContentServer,
  listAttachmentsServer,
  type GetAttachmentContentResponse,
  type ListAttachmentsInput,
  type ListAttachmentsResponse,
} from "./query.server";

export async function listAttachmentsAction(
  data: ListAttachmentsInput
): Promise<ListAttachmentsResponse> {
  return listAttachmentsServer(data);
}

export async function getAttachmentContentAction(
  attachmentId: string
): Promise<GetAttachmentContentResponse> {
  return getAttachmentContentServer(attachmentId);
}

export type {
  ListAttachmentsInput,
  ListAttachmentsResponse,
  GetAttachmentContentResponse,
} from "./query.server";
