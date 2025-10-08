"use server";

import {
  createCommentServer,
  updateCommentServer,
  deleteCommentServer,
  type CreateCommentInput,
  type CreateCommentResponse,
  type UpdateCommentInput,
  type UpdateCommentResponse,
  type DeleteCommentInput,
  type DeleteCommentResponse,
} from "./command.server";

export async function createCommentAction(
  data: CreateCommentInput
): Promise<CreateCommentResponse> {
  return createCommentServer(data);
}

export async function updateCommentAction(
  data: UpdateCommentInput
): Promise<UpdateCommentResponse> {
  return updateCommentServer(data);
}

export async function deleteCommentAction(
  data: DeleteCommentInput
): Promise<DeleteCommentResponse> {
  return deleteCommentServer(data);
}

export type {
  CreateCommentInput,
  CreateCommentResponse,
  UpdateCommentInput,
  UpdateCommentResponse,
  DeleteCommentInput,
  DeleteCommentResponse,
} from "./command.server";
