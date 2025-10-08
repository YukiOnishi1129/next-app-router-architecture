"use server";

import {
  createSessionServer,
  createUserServer,
  deleteSessionServer,
  type CreateSessionInput,
  type CreateSessionResponse,
  type CreateUserInput,
  type CreateUserResponse,
  type DeleteSessionResponse,
} from "./command.server";

export async function createSessionAction(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  return createSessionServer(data);
}

export async function createUserAction(
  data: CreateUserInput
): Promise<CreateUserResponse> {
  return createUserServer(data);
}

export async function deleteSessionAction(
  userId?: string
): Promise<DeleteSessionResponse> {
  return deleteSessionServer(userId);
}

export type {
  CreateSessionInput,
  CreateUserInput,
  CreateSessionResponse,
  CreateUserResponse,
  DeleteSessionResponse,
} from "./command.server";
