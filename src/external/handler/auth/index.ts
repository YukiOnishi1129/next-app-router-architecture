"use server";

export {
  signInAction,
  signUpAction,
  signOutAction,
  getSessionAction,
  checkPermissionAction,
} from "./action";

export {
  signInServer,
  signUpServer,
  signOutServer,
  getSessionServer,
  checkPermissionServer,
} from "./server";

export {
  signInAction as signIn,
  signUpAction as signUp,
  signOutAction as signOut,
  getSessionAction as getSession,
  checkPermissionAction as checkPermission,
} from "./action";

export type {
  SignInInput,
  SignUpInput,
  SessionInput,
  SignInResponse,
  SignUpResponse,
  SignOutResponse,
  SessionResponse,
} from "./server";
