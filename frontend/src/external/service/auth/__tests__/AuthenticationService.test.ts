/**
 * Example test file for AuthenticationService
 * 
 * This demonstrates how the new architecture enables easier testing
 * by mocking only the external client, not the entire service.
 */

import { AuthenticationService } from '../AuthenticationService';
import { IdentityPlatformClient } from '@/external/client/gcp/identity-platform';

// Mock the external client
jest.mock('@/external/client/gcp/identity-platform');

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let mockClient: jest.Mocked<IdentityPlatformClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create service instance
    authService = new AuthenticationService({
      apiKey: 'test-api-key',
      projectId: 'test-project',
    });

    // Get mock instance
    mockClient = (IdentityPlatformClient as jest.MockedClass<typeof IdentityPlatformClient>)
      .mock.instances[0] as jest.Mocked<IdentityPlatformClient>;
  });

  describe('authenticateWithGoogleCode', () => {
    it('should exchange code for tokens and return user info', async () => {
      // Arrange
      const mockCode = 'test-auth-code';
      const mockRedirectUri = 'http://localhost:3000/callback';
      
      mockClient.exchangeCodeForToken.mockResolvedValue({
        access_token: 'test-access-token',
        expires_in: '3600',
        token_type: 'Bearer',
        refresh_token: 'test-refresh-token',
        id_token: 'test-id-token',
        user_id: 'test-user-id',
        project_id: 'test-project',
      });

      mockClient.signInWithGoogleIdToken.mockResolvedValue({
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        expiresIn: '3600',
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: 'https://example.com/photo.jpg',
        registered: true,
      });

      mockClient.getUserInfo.mockResolvedValue({
        localId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: 'https://example.com/photo.jpg',
        emailVerified: true,
        createdAt: '1234567890000',
        lastLoginAt: '1234567890000',
        providerUserInfo: [
          {
            providerId: 'google.com',
            displayName: 'Test User',
            photoUrl: 'https://example.com/photo.jpg',
            email: 'test@example.com',
          },
        ],
      });

      // Act
      const result = await authService.authenticateWithGoogleCode(mockCode, mockRedirectUri);

      // Assert
      expect(result).toEqual({
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        userInfo: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          emailVerified: true,
        },
        expiresAt: expect.any(Date),
      });

      expect(mockClient.exchangeCodeForToken).toHaveBeenCalledWith(mockCode, mockRedirectUri);
      expect(mockClient.signInWithGoogleIdToken).toHaveBeenCalledWith('test-id-token');
      expect(mockClient.getUserInfo).toHaveBeenCalledWith('new-id-token');
    });

    it('should throw error when code exchange fails', async () => {
      // Arrange
      mockClient.exchangeCodeForToken.mockRejectedValue(
        new Error('Invalid authorization code')
      );

      // Act & Assert
      await expect(
        authService.authenticateWithGoogleCode('invalid-code', 'http://localhost:3000/callback')
      ).rejects.toThrow('Google authentication failed: Invalid authorization code');
    });
  });

  describe('verifyToken', () => {
    it('should return user info for valid token', async () => {
      // Arrange
      const mockToken = 'valid-token';
      mockClient.getUserInfo.mockResolvedValue({
        localId: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: '1234567890000',
        lastLoginAt: '1234567890000',
      });

      // Act
      const result = await authService.verifyToken(mockToken);

      // Assert
      expect(result).toBeTruthy();
      expect(result?.email).toBe('test@example.com');
      expect(mockClient.getUserInfo).toHaveBeenCalledWith(mockToken);
    });

    it('should return null for invalid token', async () => {
      // Arrange
      mockClient.getUserInfo.mockRejectedValue(new Error('Invalid token'));

      // Act
      const result = await authService.verifyToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const mockRefreshToken = 'old-refresh-token';
      mockClient.refreshIdToken.mockResolvedValue({
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        expiresIn: '3600',
        localId: 'user-123',
      });

      // Act
      const result = await authService.refreshToken(mockRefreshToken);

      // Assert
      expect(result.token).toBe('new-id-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.userId).toBe('user-123');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockClient.refreshIdToken).toHaveBeenCalledWith(mockRefreshToken);
    });
  });
});