/**
 * Example test file for UserManagementService
 *
 * This demonstrates testing of database operations without any external API calls.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { User, UserId, UserRole, UserStatus } from '@/external/domain'
import { UserRepository } from '@/external/repository/db/UserRepository'

import { UserManagementService } from '../UserManagementService'

import type { Mocked } from 'vitest'

// Mock the repository
vi.mock('@/external/repository/db/UserRepository')

describe('UserManagementService', () => {
  let userService: UserManagementService
  let mockRepository: Mocked<UserRepository>

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Create service instance
    userService = new UserManagementService()

    // Get mock repository instance
    const MockUserRepository = vi.mocked(UserRepository)
    const instance =
      MockUserRepository.mock.instances[
        MockUserRepository.mock.instances.length - 1
      ]

    if (!instance) {
      throw new Error('UserRepository was not instantiated')
    }

    mockRepository = instance as Mocked<UserRepository>
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        roles: [UserRole.MEMBER],
      }

      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await userService.createUser(userData)

      // Assert
      expect(result).toBeInstanceOf(User)
      expect(result.getEmail().getValue()).toBe(userData.email)
      expect(result.getName()).toBe(userData.name)
      expect(result.getRoles()).toEqual([UserRole.MEMBER])
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should throw error if user already exists', async () => {
      // Arrange
      const existingUser = User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        roles: [UserRole.MEMBER],
      })

      mockRepository.findByEmail.mockResolvedValue(existingUser)

      // Act & Assert
      await expect(
        userService.createUser({
          email: 'existing@example.com',
          name: 'New User',
        })
      ).rejects.toThrow('User with this email already exists')

      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    it('should update user profile', async () => {
      // Arrange
      const existingUser = User.create({
        name: 'Old Name',
        email: 'user@example.com',
        roles: [UserRole.MEMBER],
      })

      mockRepository.findById.mockResolvedValue(existingUser)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await userService.updateUser(
        existingUser.getId().getValue(),
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
      const existingUser = User.create({
        name: 'Test User',
        email: 'user@example.com',
        roles: [UserRole.MEMBER],
      })

      mockRepository.findById.mockResolvedValue(existingUser)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await userService.updateUser(
        existingUser.getId().getValue(),
        {
          status: UserStatus.SUSPENDED,
        }
      )

      // Assert
      expect(result.getStatus()).toBe(UserStatus.SUSPENDED)
      expect(mockRepository.save).toHaveBeenCalledWith(result)
    })

    it('should throw error if user not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null)

      // Act & Assert
      const nonExistentId = UserId.generate().getValue()

      await expect(
        userService.updateUser(nonExistentId, { name: 'New Name' })
      ).rejects.toThrow('User not found')
    })
  })

  describe('getOrCreateUser', () => {
    it('should return existing user if found', async () => {
      // Arrange
      const existingUser = User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        roles: [UserRole.MEMBER],
      })

      mockRepository.findByEmail.mockResolvedValue(existingUser)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await userService.getOrCreateUser({
        email: 'existing@example.com',
        name: 'Updated Name',
      })

      // Assert
      expect(result).toBe(existingUser)
      expect(result.getName()).toBe('Updated Name')
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it('should create new user if not found', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      const result = await userService.getOrCreateUser({
        email: 'new@example.com',
        name: 'New User',
      })

      // Assert
      expect(result.getEmail().getValue()).toBe('new@example.com')
      expect(result.getName()).toBe('New User')
      expect(mockRepository.save).toHaveBeenCalled()
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      // Arrange
      const adminUser = User.create({
        name: 'Admin',
        email: 'admin@example.com',
        roles: [UserRole.ADMIN],
      })

      // Act & Assert
      expect(userService.hasPermission(adminUser, 'any.permission')).toBe(true)
      expect(userService.hasPermission(adminUser, 'another.permission')).toBe(
        true
      )
    })

    it('should check specific permissions for member', () => {
      // Arrange
      const memberUser = User.create({
        name: 'Member',
        email: 'member@example.com',
        roles: [UserRole.MEMBER],
      })

      // Act & Assert
      expect(userService.hasPermission(memberUser, 'request.create')).toBe(true)
      expect(userService.hasPermission(memberUser, 'request.delete')).toBe(
        false
      )
      expect(userService.hasPermission(memberUser, 'user.view.self')).toBe(true)
      expect(userService.hasPermission(memberUser, 'user.delete')).toBe(false)
    })

    it('should check permissions for guest', () => {
      // Arrange
      const guestUser = User.create({
        name: 'Guest',
        email: 'guest@example.com',
        roles: [UserRole.GUEST],
      })

      // Act & Assert
      expect(userService.hasPermission(guestUser, 'request.view')).toBe(true)
      expect(userService.hasPermission(guestUser, 'request.create')).toBe(false)
      expect(userService.hasPermission(guestUser, 'user.view.self')).toBe(true)
    })
  })
})
