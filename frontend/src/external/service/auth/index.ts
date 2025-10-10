/**
 * Authentication Services Export
 *
 * This module exports the authentication-related services
 * with proper separation of concerns.
 */

export { AuthenticationService } from './AuthenticationService'
export { AccountManagementService } from './AccountManagementService'
export type { AuthToken } from './AuthenticationService'
export type {
  AccountProfile,
  CreateAccountData,
  UpdateAccountData,
} from './AccountManagementService'
