"use server";

import {
  checkPermissionServer,
  getSessionServer,
  type GetSessionInput,
  type GetSessionResponse,
} from "./query.server";

export async function getSessionAction(
  data?: GetSessionInput
): Promise<GetSessionResponse> {
  return getSessionServer(data);
}

export async function checkPermissionAction(
  permission: string
): Promise<boolean> {
  return checkPermissionServer(permission);
}

export type { GetSessionInput, GetSessionResponse } from "./query.server";
