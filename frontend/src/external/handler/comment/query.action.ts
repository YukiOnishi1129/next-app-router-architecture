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

import { getCommentThreadServer, listCommentsServer } from "./query.server";

import type {
  GetCommentThreadResponse,
  ListCommentsInput,
  ListCommentsResponse,
} from "./query.server";

export async function listCommentsAction(
  data: ListCommentsInput
): Promise<ListCommentsResponse> {
  return listCommentsServer(data);
}

export async function getCommentThreadAction(
  commentId: string
): Promise<GetCommentThreadResponse> {
  return getCommentThreadServer(commentId);
}

export type {
  ListCommentsInput,
  ListCommentsResponse,
  GetCommentThreadResponse,
} from "./query.server";
