"use server";

import {
  checkPermissionServer,
  getSessionServer,
  signInServer,
  signOutServer,
  signUpServer,
  type SessionInput,
  type SessionResponse,
  type SignInInput,
  type SignInResponse,
  type SignOutResponse,
  type SignUpInput,
  type SignUpResponse,
} from "./server";

export async function signInAction(
  data: SignInInput
): Promise<SignInResponse> {
  return signInServer(data);
}

export async function signUpAction(
  data: SignUpInput
): Promise<SignUpResponse> {
  return signUpServer(data);
}

export async function signOutAction(
  userId?: string
): Promise<SignOutResponse> {
  return signOutServer(userId);
}

export async function getSessionAction(
  data?: SessionInput
): Promise<SessionResponse> {
  return getSessionServer(data);
}

export async function checkPermissionAction(
  permission: string
): Promise<boolean> {
  return checkPermissionServer(permission);
}

export type {
  SignInInput,
  SignUpInput,
  SessionInput,
  SignInResponse,
  SignUpResponse,
  SignOutResponse,
  SessionResponse,
} from "./server";
