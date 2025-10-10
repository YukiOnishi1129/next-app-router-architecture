import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IdentityPlatformClient } from '@/external/client/gcp/identity-platform'

import { AuthenticationService } from '../AuthenticationService'

const createIdentityPlatformClientMock = () => ({
  signUpWithEmailPassword: vi.fn(),
  signInWithEmailPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  getUserInfo: vi.fn(),
  verifyIdToken: vi.fn(),
  refreshIdToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteUserAccount: vi.fn(),
})

type IdentityPlatformClientMock = ReturnType<
  typeof createIdentityPlatformClientMock
>

vi.mock('@/external/client/gcp/identity-platform', async () => {
  const actual = await vi.importActual<
    typeof import('@/external/client/gcp/identity-platform')
  >('@/external/client/gcp/identity-platform')

  const factory = vi
    .fn(
      (..._args: ConstructorParameters<typeof actual.IdentityPlatformClient>) =>
        createIdentityPlatformClientMock()
    )
    .mockName('IdentityPlatformClient')

  return {
    ...actual,
    IdentityPlatformClient:
      factory as unknown as typeof actual.IdentityPlatformClient,
  }
})

describe('AuthenticationService (Identity Platform)', () => {
  let service: AuthenticationService
  let mockClient: IdentityPlatformClientMock

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AuthenticationService({
      apiKey: 'fake-api-key',
      projectId: 'fake-project',
    })

    const MockIdentityPlatformClient = vi.mocked(IdentityPlatformClient)
    const lastResult =
      MockIdentityPlatformClient.mock.results[
        MockIdentityPlatformClient.mock.results.length - 1
      ]

    if (!lastResult || lastResult.type !== 'return') {
      throw new Error('IdentityPlatformClient was not instantiated')
    }

    mockClient = lastResult.value as unknown as IdentityPlatformClientMock
  })

  describe('signUpWithEmailPassword', () => {
    it('signs up, fetches user info, and sends verification email', async () => {
      mockClient.signUpWithEmailPassword.mockResolvedValue({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        registered: true,
      })

      mockClient.getUserInfo.mockResolvedValue({
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
        createdAt: '1234567890',
        lastLoginAt: '1234567890',
      })

      mockClient.sendEmailVerification.mockResolvedValue(undefined)

      const result = await service.signUpWithEmailPassword(
        'test@example.com',
        'password',
        'Test User'
      )

      expect(mockClient.signUpWithEmailPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test User',
      })
      expect(mockClient.getUserInfo).toHaveBeenCalledWith('id-token')
      expect(mockClient.sendEmailVerification).toHaveBeenCalledWith('id-token')

      expect(result).toMatchObject({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        userInfo: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: false,
        },
      })
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('signInWithEmailPassword', () => {
    it('returns auth result with user profile', async () => {
      mockClient.signInWithEmailPassword.mockResolvedValue({
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        registered: true,
      })

      mockClient.getUserInfo.mockResolvedValue({
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        createdAt: '1234567890',
        lastLoginAt: '1234567890',
      })

      const result = await service.signInWithEmailPassword(
        'test@example.com',
        'password'
      )

      expect(mockClient.signInWithEmailPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
      expect(mockClient.getUserInfo).toHaveBeenCalledWith('id-token')
      expect(result.userInfo.emailVerified).toBe(true)
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('verifyToken', () => {
    it('returns user info when token is valid', async () => {
      mockClient.verifyIdToken.mockResolvedValue(true)
      mockClient.getUserInfo.mockResolvedValue({
        localId: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: '1234567890',
        lastLoginAt: '1234567890',
      })

      const result = await service.verifyToken('valid-token')

      expect(mockClient.verifyIdToken).toHaveBeenCalledWith('valid-token')
      expect(mockClient.getUserInfo).toHaveBeenCalledWith('valid-token')
      expect(result?.email).toBe('test@example.com')
    })

    it('returns null when token verification fails', async () => {
      mockClient.verifyIdToken.mockResolvedValue(false)

      const result = await service.verifyToken('invalid-token')

      expect(mockClient.verifyIdToken).toHaveBeenCalledWith('invalid-token')
      expect(mockClient.getUserInfo).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('returns refreshed token data', async () => {
      mockClient.refreshIdToken.mockResolvedValue({
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        expiresIn: '3600',
        localId: 'user-123',
      })

    const result = await service.refreshToken('old-refresh-token')

    expect(mockClient.refreshIdToken).toHaveBeenCalledWith(
      'old-refresh-token'
    )
    expect(result).toEqual({
      token: 'new-id-token',
      refreshToken: 'new-refresh-token',
      expiresIn: '3600',
    })
  })

    it('returns null when refresh fails', async () => {
      mockClient.refreshIdToken.mockRejectedValue(
        new Error('invalid refresh token')
      )

      const result = await service.refreshToken('bad-token')

      expect(result).toBeNull()
    })
  })
})
