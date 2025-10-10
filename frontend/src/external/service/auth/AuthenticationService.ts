/**
 * Authentication Service
 *
 * This service handles authentication logic only.
 * It delegates to the Google Identity Platform API client for all external API calls.
 * It does not interact with the database directly.
 */

import {
  IdentityPlatformClient,
  AccountInfo,
} from '@/external/client/gcp/identity-platform'

export interface AuthToken {
  token: string
  refreshToken: string
  expiresAt: Date
  accountId: string
}

export interface EmailPasswordAuthResult {
  idToken: string
  refreshToken: string
  userInfo: {
    id: string
    email: string
    name: string
    emailVerified: boolean
  }
  expiresAt: Date
}

export class AuthenticationService {
  private identityPlatformClient: IdentityPlatformClient

  constructor(gcpConfig: { apiKey: string; projectId: string }) {
    this.identityPlatformClient = new IdentityPlatformClient(gcpConfig)
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmailPassword(
    email: string,
    password: string,
    displayName?: string
  ): Promise<EmailPasswordAuthResult> {
    // Sign up the user
    const authResult =
      await this.identityPlatformClient.signUpWithEmailPassword({
        email,
        password,
        displayName,
      })

    // Get detailed user info
    const userInfo = await this.identityPlatformClient.getAccountInfo(
      authResult.idToken
    )

    // Send verification email
    await this.identityPlatformClient.sendEmailVerification(authResult.idToken)

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setSeconds(
      expiresAt.getSeconds() + parseInt(authResult.expiresIn)
    )

    return {
      idToken: authResult.idToken,
      refreshToken: authResult.refreshToken,
      userInfo: {
        id: userInfo.localId,
        email: userInfo.email,
        name: userInfo.displayName || userInfo.email.split('@')[0],
        emailVerified: userInfo.emailVerified,
      },
      expiresAt,
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailPassword(
    email: string,
    password: string
  ): Promise<EmailPasswordAuthResult> {
    // Sign in the user
    const authResult =
      await this.identityPlatformClient.signInWithEmailPassword({
        email,
        password,
      })

    // Get detailed user info
    const userInfo = await this.identityPlatformClient.getAccountInfo(
      authResult.idToken
    )

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setSeconds(
      expiresAt.getSeconds() + parseInt(authResult.expiresIn)
    )

    return {
      idToken: authResult.idToken,
      refreshToken: authResult.refreshToken,
      userInfo: {
        id: userInfo.localId,
        email: userInfo.email,
        name: userInfo.displayName || userInfo.email.split('@')[0],
        emailVerified: userInfo.emailVerified,
      },
      expiresAt,
    }
  }

  /**
   * Verify ID token and get user info
   */
  async verifyToken(idToken: string): Promise<AccountInfo | null> {
    try {
      const isValid = await this.identityPlatformClient.verifyIdToken(idToken)
      if (!isValid) {
        return null
      }

      return await this.identityPlatformClient.getAccountInfo(idToken)
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{
    token: string
    refreshToken?: string
    expiresIn?: string
  } | null> {
    try {
      const newTokens =
        await this.identityPlatformClient.refreshIdToken(refreshToken)

      return {
        token: newTokens.idToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  /**
   * Revoke authentication (placeholder for now)
   */
  async revokeAuthentication(): Promise<void> {
    // In a production environment, you would call the Admin SDK endpoint
    // to revoke the token. For now, this is a placeholder
    console.log(`Revoking authentication token`)
  }

  /**
   * Update user profile in Identity Platform
   */
  async updateAccountProfile(
    idToken: string,
    updates: {
      displayName?: string
      photoUrl?: string
    }
  ): Promise<AccountInfo> {
    return await this.identityPlatformClient.updateAccountProfile(
      idToken,
      updates
    )
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    return await this.identityPlatformClient.sendPasswordResetEmail(email)
  }

  /**
   * Delete user account
   */
  async deleteAccountAccount(idToken: string): Promise<void> {
    return await this.identityPlatformClient.deleteAccountAccount(idToken)
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(idToken: string): Promise<void> {
    return await this.identityPlatformClient.sendEmailVerification(idToken)
  }
}
