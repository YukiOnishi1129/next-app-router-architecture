"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

"use server";

import {
  createCommentServer,
  updateCommentServer,
  deleteCommentServer,
} from "./command.server";

import type {
  CreateCommentInput,
  CreateCommentResponse,
  UpdateCommentInput,
  UpdateCommentResponse,
  DeleteCommentInput,
  DeleteCommentResponse,
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
