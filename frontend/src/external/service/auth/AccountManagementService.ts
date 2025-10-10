/**
 * Account Management Service
 *
 * This service handles account database operations only.
 * It does not make any external API calls.
 */

import {
  Account,
  AccountId,
  Email,
  AccountRole,
  AccountStatus,
} from '@/external/domain'
import { AccountRepository } from '@/external/repository'

export interface AccountProfile {
  id: string
  email: string
  name: string
  status: AccountStatus
  roles: AccountRole[]
}

export interface CreateAccountData {
  email: string
  name: string
  externalId?: string
  roles?: AccountRole[]
}

export interface UpdateAccountData {
  name?: string
  email?: string
  status?: AccountStatus
  roles?: AccountRole[]
}

export interface ListAccountsParams {
  status?: AccountStatus
  role?: AccountRole
  search?: string
  limit?: number
  offset?: number
}

export class AccountManagementService {
  private readonly accountRepository: AccountRepository

  constructor(accountRepository: AccountRepository = new AccountRepository()) {
    this.accountRepository = accountRepository
  }

  /**
   * Find account by ID
   */
  async findAccountById(accountId: string): Promise<Account | null> {
    return this.accountRepository.findById(AccountId.create(accountId))
  }

  /**
   * Find account by email
   */
  async findAccountByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findByEmail(new Email(email))
  }

  /**
   * Create new account
   */
  async createAccount(data: CreateAccountData): Promise<Account> {
    // Check if account already exists
    const existingAccount = await this.accountRepository.findByEmail(
      new Email(data.email)
    )
    if (existingAccount) {
      throw new Error('Account with this email already exists')
    }

    // Create new account
    const account = Account.create({
      name: data.name,
      email: data.email,
      roles: data.roles || [AccountRole.MEMBER],
    })

    // Save to database
    await this.accountRepository.save(account)
    return account
  }

  /**
   * List accounts with optional filtering and pagination
   */
  async listAccounts(params: ListAccountsParams = {}): Promise<{
    accounts: Account[]
    total: number
    limit: number
    offset: number
  }> {
    const { status, role, search, limit, offset } = params
    const allAccounts = await this.accountRepository.findAll()

    const filtered = allAccounts.filter((account) => {
      if (status && account.getStatus() !== status) {
        return false
      }
      if (role && !account.hasRole(role)) {
        return false
      }
      if (search) {
        const query = search.toLowerCase()
        const matchesName = account.getName().toLowerCase().includes(query)
        const matchesEmail = account
          .getEmail()
          .getValue()
          .toLowerCase()
          .includes(query)
        if (!matchesName && !matchesEmail) {
          return false
        }
      }
      return true
    })

    const total = filtered.length
    const start = offset ?? 0
    const pageSize = limit ?? total
    const paginated =
      pageSize === total && start === 0
        ? filtered
        : filtered.slice(start, start + pageSize)

    return {
      accounts: paginated,
      total,
      limit: pageSize,
      offset: start,
    }
  }

  /**
   * Update existing account
   */
  async updateAccount(
    accountId: string,
    data: UpdateAccountData
  ): Promise<Account> {
    const account = await this.accountRepository.findById(
      AccountId.create(accountId)
    )
    if (!account) {
      throw new Error('Account not found')
    }

    // Update profile if name or email changed
    if (data.name || data.email) {
      account.updateProfile(
        data.name || account.getName(),
        data.email || account.getEmail().getValue()
      )
    }

    // Update status if changed
    if (data.status && data.status !== account.getStatus()) {
      account.changeStatus(data.status)
    }

    // Update roles if changed
    if (data.roles) {
      // Remove all current roles
      const currentRoles = account.getRoles()
      currentRoles.forEach((role) => account.removeRole(role))

      // Add new roles
      data.roles.forEach((role) => account.assignRole(role))
    }

    await this.accountRepository.save(account)
    return account
  }

  /**
   * Get or create account
   */
  async getOrCreateAccount(data: CreateAccountData): Promise<Account> {
    const existingAccount = await this.accountRepository.findByEmail(
      new Email(data.email)
    )

    if (existingAccount) {
      // Update account info if needed
      if (existingAccount.getName() !== data.name) {
        existingAccount.updateProfile(
          data.name,
          existingAccount.getEmail().getValue()
        )
        await this.accountRepository.save(existingAccount)
      }
      return existingAccount
    }

    return this.createAccount(data)
  }

  /**
   * Delete account
   */
  async deleteAccount(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(
      AccountId.create(accountId)
    )
    if (!account) {
      throw new Error('Account not found')
    }

    await this.accountRepository.delete(account.getId())
  }

  /**
   * Update account roles
   */
  async updateAccountRoles(
    accountId: string,
    roles: AccountRole[]
  ): Promise<Account> {
    return this.updateAccount(accountId, { roles })
  }

  /**
   * Update account status
   */
  async updateAccountStatus(
    accountId: string,
    status: AccountStatus
  ): Promise<Account> {
    return this.updateAccount(accountId, { status })
  }

  /**
   * Update account profile
   */
  async updateAccountProfile(
    accountId: string,
    name: string,
    email: string
  ): Promise<Account> {
    return this.updateAccount(accountId, { name, email })
  }

  /**
   * Check if account has specific permission
   */
  hasPermission(account: Account, permission: string): boolean {
    const permissions = this.getPermissionsForRoles(account.getRoles())
    return permissions.includes('*') || permissions.includes(permission)
  }

  /**
   * Get permissions for account
   */
  getAccountPermissions(account: Account): string[] {
    return this.getPermissionsForRoles(account.getRoles())
  }

  /**
   * Convert account to profile
   */
  toAccountProfile(account: Account): AccountProfile {
    return {
      id: account.getId().getValue(),
      email: account.getEmail().getValue(),
      name: account.getName(),
      status: account.getStatus(),
      roles: account.getRoles(),
    }
  }

  /**
   * Get permissions for roles
   */
  private getPermissionsForRoles(roles: AccountRole[]): string[] {
    const permissionMap: Record<AccountRole, string[]> = {
      [AccountRole.ADMIN]: ['*'], // Admin has all permissions
      [AccountRole.MEMBER]: [
        'request.view',
        'request.create',
        'request.update.own',
        'request.view.own',
        'account.view.self',
        'account.update.self',
      ],
      [AccountRole.GUEST]: ['request.view', 'account.view.self'],
    }

    const allPermissions = new Set<string>()

    roles.forEach((role) => {
      const rolePermissions = permissionMap[role] || []
      rolePermissions.forEach((permission) => allPermissions.add(permission))
    })

    return Array.from(allPermissions)
  }
}
