"use server";

import {
  getCurrentUserServer,
  getUserServer,
  listUsersServer,
} from "./query.server";

import type {
  GetUserResponse,
  ListUsersInput,
  ListUsersResponse,
} from "./query.server";

export async function listUsersAction(
  data?: ListUsersInput
): Promise<ListUsersResponse> {
  return listUsersServer(data);
}

export async function getUserAction(userId: string): Promise<GetUserResponse> {
  return getUserServer(userId);
}

export async function getCurrentUserAction(): Promise<GetUserResponse> {
  return getCurrentUserServer();
}

export type {
  ListUsersInput,
  ListUsersResponse,
  GetUserResponse,
} from "./query.server";
