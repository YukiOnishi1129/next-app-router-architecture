/**
 * Example test file for AccountManagementService
 *
 * This demonstrates testing of database operations without any external API calls.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  Account,
  AccountId,
  AccountRole,
  AccountStatus,
} from '@/external/domain'
import { AccountRepository } from '@/external/repository/db/AccountRepository'

import { AccountManagementService } from '../AccountManagementService'

import type { Mocked } from 'vitest'

// Mock the repository
vi.mock('@/external/repository/db/AccountRepository')

describe('AccountManagementService', () => {
  let accountService: AccountManagementService
  let mockRepository: Mocked<AccountRepository>

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Create service instance
    accountService = new AccountManagementService()

    // Get mock repository instance
    const MockAccountRepository = vi.mocked(AccountRepository)
    const instance =
      MockAccountRepository.mock.instances[
        MockAccountRepository.mock.instances.length - 1
      ]

    if (!instance) {
      throw new Error('AccountRepository was not instantiated')
    }

    mockRepository = instance as Mocked<AccountRepository>
  })

  describe('createAccount', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New Account',
        roles: [AccountRole.MEMBER],
      }

      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await accountService.createAccount(userData)

      // Assert
      expect(result).toBeInstanceOf(Account)
      expect(result.getEmail().getValue()).toBe(userData.email)
      expect(result.getName()).toBe(userData.name)
      expect(result.getRoles()).toEqual([AccountRole.MEMBER])
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should throw error if user already exists', async () => {
      // Arrange
      const existingAccount = Account.create({
        name: 'Existing Account',
        email: 'existing@example.com',
        roles: [AccountRole.MEMBER],
      })

      mockRepository.findByEmail.mockResolvedValue(existingAccount)

      // Act & Assert
      await expect(
        accountService.createAccount({
          email: 'existing@example.com',
          name: 'New Account',
        })
      ).rejects.toThrow('Account with this email already exists')

      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('updateAccount', () => {
    it('should update user profile', async () => {
      // Arrange
      const existingAccount = Account.create({
        name: 'Old Name',
        email: 'user@example.com',
        roles: [AccountRole.MEMBER],
      })

      mockRepository.findById.mockResolvedValue(existingAccount)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await accountService.updateAccount(
        existingAccount.getId().getValue(),
        {
          name: 'New Name',
          email: 'newemail@example.com',
        }
      )

      // Assert
      expect(result.getName()).toBe('New Name')
      expect(result.getEmail().getValue()).toBe('newemail@example.com')
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should update user status', async () => {
      // Arrange
      const existingAccount = Account.create({
        name: 'Test Account',
        email: 'user@example.com',
        roles: [AccountRole.MEMBER],
      })

      mockRepository.findById.mockResolvedValue(existingAccount)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await accountService.updateAccount(
        existingAccount.getId().getValue(),
        {
          status: AccountStatus.SUSPENDED,
        }
      )

      // Assert
      expect(result.getStatus()).toBe(AccountStatus.SUSPENDED)
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should throw error if user not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null)

      // Act & Assert
      const nonExistentId = AccountId.generate().getValue()

      await expect(
        accountService.updateAccount(nonExistentId, { name: 'New Name' })
      ).rejects.toThrow('Account not found')
    })
  })

  describe('getOrCreateAccount', () => {
    it('should return existing user if found', async () => {
      // Arrange
      const existingAccount = Account.create({
        name: 'Existing Account',
        email: 'existing@example.com',
        roles: [AccountRole.MEMBER],
      })

      mockRepository.findByEmail.mockResolvedValue(existingAccount)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await accountService.getOrCreateAccount({
        email: 'existing@example.com',
        name: 'Updated Name',
      })

      // Assert
      expect(result).toBe(existingAccount)
      expect(result.getName()).toBe('Updated Name')
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should create new user if not found', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await accountService.getOrCreateAccount({
        email: 'new@example.com',
        name: 'New Account',
      })

      // Assert
      expect(result.getEmail().getValue()).toBe('new@example.com')
      expect(result.getName()).toBe('New Account')
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      // Arrange
      const adminAccount = Account.create({
        name: 'Admin',
        email: 'admin@example.com',
        roles: [AccountRole.ADMIN],
      })

      // Act & Assert
      expect(accountService.hasPermission(adminAccount, 'any.permission')).toBe(
        true
      )
      expect(
        accountService.hasPermission(adminAccount, 'another.permission')
      ).toBe(true)
    })

    it('should check specific permissions for member', () => {
      // Arrange
      const memberAccount = Account.create({
        name: 'Member',
        email: 'member@example.com',
        roles: [AccountRole.MEMBER],
      })

      // Act & Assert
      expect(
        accountService.hasPermission(memberAccount, 'request.create')
      ).toBe(true)
      expect(
        accountService.hasPermission(memberAccount, 'request.delete')
      ).toBe(false)
      expect(
        accountService.hasPermission(memberAccount, 'account.view.self')
      ).toBe(true)
      expect(
        accountService.hasPermission(memberAccount, 'account.delete')
      ).toBe(false)
    })

    it('should check permissions for guest', () => {
      // Arrange
      const guestAccount = Account.create({
        name: 'Guest',
        email: 'guest@example.com',
        roles: [AccountRole.GUEST],
      })

      // Act & Assert
      expect(accountService.hasPermission(guestAccount, 'request.view')).toBe(
        true
      )
      expect(accountService.hasPermission(guestAccount, 'request.create')).toBe(
        false
      )
      expect(
        accountService.hasPermission(guestAccount, 'account.view.self')
      ).toBe(true)
    })
  })
})
