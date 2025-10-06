import { User } from '@/external/domain/models/User';
import { UserRole } from '@/external/domain/valueobjects/UserRole';
import { UserRepository } from '@/external/repository/UserRepository';
import { AuditService, AuditContext } from './AuditService';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';

export interface AuthenticationResult {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export class AuthenticationService {
  private firebaseApp: FirebaseApp;
  private auth: any;
  private googleProvider: GoogleAuthProvider;

  constructor(
    private userRepository: UserRepository,
    private auditService: AuditService,
    firebaseConfig: Record<string, string>
  ) {
    // Initialize Firebase
    this.firebaseApp = initializeApp(firebaseConfig);
    this.auth = getAuth(this.firebaseApp);
    this.googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  /**
   * Authenticate user with Google
   */
  async authenticateWithGoogle(context?: AuditContext): Promise<AuthenticationResult> {
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential) {
        throw new Error('Failed to obtain Google credentials');
      }

      const firebaseUser = result.user;
      const googleUserInfo = this.extractGoogleUserInfo(firebaseUser);
      
      // Get or create user in our system
      let user = await this.userRepository.findByEmail(googleUserInfo.email);
      
      if (!user) {
        // Create new user
        user = await this.createUserFromGoogle(googleUserInfo);
      } else {
        // Update user info from Google
        user = await this.updateUserFromGoogle(user, googleUserInfo);
      }

      // Get ID token
      const token = await firebaseUser.getIdToken();
      const tokenResult = await firebaseUser.getIdTokenResult();
      const expiresAt = new Date(tokenResult.expirationTime);

      // Log authentication
      await this.auditService.logUserLogin(user, context);

      return {
        user,
        token,
        expiresAt
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      // Verify token with Firebase Admin SDK (in production)
      // For now, we'll use the client SDK approach
      const auth = getAuth(this.firebaseApp);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return null;
      }

      const idToken = await currentUser.getIdToken();
      
      if (idToken !== token) {
        return null;
      }

      // Get user from our database
      const user = await this.userRepository.findByEmail(currentUser.email!);
      return user;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(currentToken: string): Promise<AuthenticationResult | null> {
    try {
      const user = await this.verifyToken(currentToken);
      if (!user) {
        return null;
      }

      const auth = getAuth(this.firebaseApp);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return null;
      }

      // Force token refresh
      const newToken = await currentUser.getIdToken(true);
      const tokenResult = await currentUser.getIdTokenResult();
      const expiresAt = new Date(tokenResult.expirationTime);

      return {
        user,
        token: newToken,
        expiresAt
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  async signOut(userId: string, context?: AuditContext): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Sign out from Firebase
      await signOut(this.auth);

      // Log sign out
      await this.auditService.logUserLogout(user, context);
    } catch (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const auth = getAuth(this.firebaseApp);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }

    return this.userRepository.findByEmail(currentUser.email!);
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.userRepository.findByEmail(firebaseUser.email!);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: string): boolean {
    // Define role-based permissions
    const permissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['*'], // Admin has all permissions
      [UserRole.MANAGER]: [
        'request.view',
        'request.create',
        'request.update',
        'request.approve',
        'user.view',
        'report.view',
        'report.export'
      ],
      [UserRole.EMPLOYEE]: [
        'request.view.own',
        'request.create',
        'request.update.own',
        'user.view.self'
      ]
    };

    const userPermissions = permissions[user.role] || [];
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return userPermissions.includes(permission);
  }

  /**
   * Extract Google user info
   */
  private extractGoogleUserInfo(firebaseUser: FirebaseUser): GoogleUserInfo {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      photoURL: firebaseUser.photoURL
    };
  }

  /**
   * Create user from Google info
   */
  private async createUserFromGoogle(googleInfo: GoogleUserInfo): Promise<User> {
    const user = new User(
      this.generateUserId(),
      googleInfo.email,
      googleInfo.displayName,
      UserRole.EMPLOYEE, // Default role
      new Date(),
      new Date()
    );

    await this.userRepository.save(user);
    return user;
  }

  /**
   * Update user from Google info
   */
  private async updateUserFromGoogle(
    user: User,
    googleInfo: GoogleUserInfo
  ): Promise<User> {
    // Update user info if changed
    if (user.name !== googleInfo.displayName) {
      const updatedUser = new User(
        user.id,
        user.email,
        googleInfo.displayName,
        user.role,
        user.createdAt,
        new Date()
      );

      await this.userRepository.save(updatedUser);
      return updatedUser;
    }

    return user;
  }

  /**
   * Generate user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}