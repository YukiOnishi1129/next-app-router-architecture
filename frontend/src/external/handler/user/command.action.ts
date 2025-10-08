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
  updateUserRoleServer,
  updateUserStatusServer,
  updateUserProfileServer,
} from "./command.server";

import type {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
  UpdateUserResponse,
} from "./command.server";

export async function updateUserRoleAction(
  data: UpdateUserRoleInput
): Promise<UpdateUserResponse> {
  return updateUserRoleServer(data);
}

export async function updateUserStatusAction(
  data: UpdateUserStatusInput
): Promise<UpdateUserResponse> {
  return updateUserStatusServer(data);
}

export async function updateUserProfileAction(
  data: UpdateUserProfileInput
): Promise<UpdateUserResponse> {
  return updateUserProfileServer(data);
}

export type {
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
  UpdateUserResponse,
} from "./command.server";
