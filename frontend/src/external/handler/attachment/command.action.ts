"use server";

import {
  createAttachmentServer,
  deleteAttachmentServer,
  type CreateAttachmentInput,
  type CreateAttachmentResponse,
  type DeleteAttachmentInput,
  type DeleteAttachmentResponse,
} from "./command.server";

export async function createAttachmentAction(
  data: CreateAttachmentInput
): Promise<CreateAttachmentResponse> {
  return createAttachmentServer(data);
}

export async function deleteAttachmentAction(
  data: DeleteAttachmentInput
): Promise<DeleteAttachmentResponse> {
  return deleteAttachmentServer(data);
}

export type {
  CreateAttachmentInput,
  CreateAttachmentResponse,
  DeleteAttachmentInput,
  DeleteAttachmentResponse,
} from "./command.server";
