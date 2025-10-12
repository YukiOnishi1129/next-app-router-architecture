/**
 * Google Identity Platform REST API Client
 *
 * This client provides direct REST API access to Google Identity Platform
 * without using Firebase SDK. It implements the Identity Toolkit API v3.
 */

export interface GCPConfig {
  apiKey: string
  projectId: string
}

export interface IdToken {
  idToken: string
  refreshToken: string
  expiresIn: string
  localId: string
  email?: string
  displayName?: string
  photoUrl?: string
  registered?: boolean
}

export interface AccountInfo {
  localId: string
  email: string
  displayName?: string
  photoUrl?: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string
  providerAccountInfo?: Array<{
    providerId: string
    displayName?: string
    photoUrl?: string
    email?: string
  }>
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface EmailAuthResult {
  idToken: string
  refreshToken: string
  expiresIn: string
  localId: string
  email: string
  displayName?: string
  registered: boolean
}

export class IdentityPlatformClient {
  private readonly baseUrl = 'https://identitytoolkit.googleapis.com/v1'
  private readonly secureTokenUrl = 'https://securetoken.googleapis.com/v1'

  constructor(private config: GCPConfig) {}

  /**
   * Sign up with email and password
   */
  async signUpWithEmailPassword(data: SignUpData): Promise<EmailAuthResult> {
    const response = await fetch(
      `${this.baseUrl}/accounts:signUp?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
          returnSecureToken: true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Sign up failed: ${error.error?.message || 'Unknown error'}`
      )
    }

    return response.json()
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailPassword(data: SignInData): Promise<EmailAuthResult> {
    const response = await fetch(
      `${this.baseUrl}/accounts:signInWithPassword?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          returnSecureToken: true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Sign in failed: ${error.error?.message || 'Unknown error'}`
      )
    }

    return response.json()
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    idToken: string,
    options?: {
      continueUrl?: string
      canHandleCodeInApp?: boolean
    }
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/accounts:sendOobCode?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'VERIFY_EMAIL',
          idToken,
          continueUrl: options?.continueUrl,
          canHandleCodeInApp: options?.canHandleCodeInApp ?? true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to send verification email: ${error.error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Send email change verification
   */
  async sendEmailChangeVerification(
    idToken: string,
    newEmail: string,
    options?: {
      continueUrl?: string
      canHandleCodeInApp?: boolean
    }
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/accounts:sendOobCode?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'VERIFY_AND_CHANGE_EMAIL',
          idToken,
          newEmail,
          continueUrl: options?.continueUrl,
          canHandleCodeInApp: options?.canHandleCodeInApp ?? true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to send email change verification: ${error.error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/accounts:sendOobCode?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to send password reset email: ${error.error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Update user profile
   */
  async updateAccountProfile(
    idToken: string,
    updates: {
      displayName?: string
      photoUrl?: string
      email?: string
    }
  ): Promise<AccountProfileUpdateResult> {
    const response = await fetch(
      `${this.baseUrl}/accounts:update?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          ...updates,
          returnSecureToken: Boolean(updates.email),
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to update profile: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    const tokenForLookup = (data.idToken as string | undefined) ?? idToken

    const account = await this.getAccountInfo(tokenForLookup)
    if (!account) {
      throw new Error('Failed to retrieve updated account information')
    }

    return {
      account,
      idToken: data.idToken as string | undefined,
      refreshToken: data.refreshToken as string | undefined,
    }
  }

  /**
   * Update account password
   */
  async updateAccountPassword(
    idToken: string,
    password: string
  ): Promise<{ idToken?: string; refreshToken?: string }> {
    const response = await fetch(
      `${this.baseUrl}/accounts:update?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          password,
          returnSecureToken: true,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to update password: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return {
      idToken: data.idToken as string | undefined,
      refreshToken: data.refreshToken as string | undefined,
    }
  }

  /**
   * Confirm email verification using OOB code
   */
  async confirmEmailVerification(oobCode: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/accounts:update?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to verify email: ${error.error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Confirm email change using OOB code
   */
  async confirmEmailChange(oobCode: string): Promise<{
    email: string
    localId: string
  }> {
    const response = await fetch(
      `${this.baseUrl}/accounts:update?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode,
          returnSecureToken: false,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to confirm email change: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return {
      email: data.email,
      localId: data.localId,
    }
  }

  /**
   * Delete user account
   */
  async deleteAccountAccount(idToken: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/accounts:delete?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to delete account: ${error.error?.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Get user information by ID token
   */
  async getAccountInfo(idToken: string): Promise<AccountInfo> {
    const response = await fetch(
      `${this.baseUrl}/accounts:lookup?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to get user info: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return data.users?.[0] || null
  }

  /**
   * Refresh ID token
   */
  async refreshIdToken(refreshToken: string): Promise<IdToken> {
    const response = await fetch(
      `${this.secureTokenUrl}/token?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Token refresh failed: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return {
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      localId: data.user_id,
    }
  }

  /**
   * Verify ID token
   */
  async verifyIdToken(idToken: string): Promise<boolean> {
    try {
      const userInfo = await this.getAccountInfo(idToken)
      return !!userInfo
    } catch {
      return false
    }
  }
}
export interface AccountProfileUpdateResult {
  account: AccountInfo
  idToken?: string
  refreshToken?: string
}
