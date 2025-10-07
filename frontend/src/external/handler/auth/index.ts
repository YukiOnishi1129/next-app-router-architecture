"use server";

export { signInAction, signUpAction, signOutAction } from "./command.action";

export { getSessionAction, checkPermissionAction } from "./query.action";

export { signInServer, signUpServer, signOutServer } from "./command.server";

export { getSessionServer, checkPermissionServer } from "./query.server";

export {
  signInAction as signIn,
  signUpAction as signUp,
  signOutAction as signOut,
} from "./command.action";

export {
  getSessionAction as getSession,
  checkPermissionAction as checkPermission,
  getSessionAction as getSessionQueryAction,
  checkPermissionAction as checkPermissionQueryAction,
} from "./query.action";

export type {
  SignInInput,
  SignUpInput,
  SignInResponse,
  SignUpResponse,
  SignOutResponse,
} from "./command.server";

export type { SessionInput, SessionResponse } from "./query.server";
