'use server'

export {
  updateUserRoleAction,
  updateUserStatusAction,
  updateUserProfileAction,
} from './command.action'

export {
  listUsersAction,
  getUserAction,
  getCurrentUserAction,
} from './query.action'

export {
  updateUserRoleServer,
  updateUserStatusServer,
  updateUserProfileServer,
} from './command.server'

export {
  listUsersServer,
  getUserServer,
  getCurrentUserServer,
} from './query.server'

// Backwards-compatible aliases
export {
  listUsersAction as getUsers,
  getUserAction as getUserById,
  getCurrentUserAction as getMyProfile,
} from './query.action'

export {
  updateUserRoleAction as updateUserRole,
  updateUserStatusAction as updateUserStatus,
  updateUserProfileAction as updateUserProfile,
} from './command.action'

export type {
  UpdateUserRoleInput,
  UpdateUserResponse,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
} from './command.server'

export type {
  ListUsersInput,
  ListUsersResponse,
  GetUserResponse,
} from './query.server'

import type { GetUserResponse, ListUsersResponse } from './query.server'

export type UserResponse = GetUserResponse
export type UserListResponse = ListUsersResponse
