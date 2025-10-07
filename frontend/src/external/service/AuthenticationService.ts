import { User, UserId, UserRole } from "@/external/domain";
import { UserRepository } from "@/external/repository/UserRepository";
import { AuditService, AuditContext } from "./AuditService";

export interface AuthenticationResult {
  user: User;
  token: string;
  expiresAt: Date;
}

/**
 * Legacy Authentication Service
 * This class is deprecated and should not be used.
 * Use AuthenticationService from /auth/AuthenticationService.ts instead.
 * @deprecated
 */
export class AuthenticationService {
  private userRepository: UserRepository;

  constructor(
    private auditService: AuditService,
    _firebaseConfig: Record<string, string>
  ) {
    // Initialize repositories
    this.userRepository = new UserRepository();

    console.warn(
      "This AuthenticationService is deprecated. Use auth/AuthenticationService.ts instead."
    );
  }

  /**
   * @deprecated Use email/password authentication instead
   */
  async authenticateWithGoogle(
    _context?: AuditContext
  ): Promise<AuthenticationResult> {
    throw new Error(
      "Google authentication is no longer supported. Use email/password authentication."
    );
  }

  /**
   * @deprecated Token verification should be done through auth/AuthenticationService.ts
   */
  async verifyToken(_token: string): Promise<User | null> {
    throw new Error("Use auth/AuthenticationService.ts for token verification");
  }

  /**
   * @deprecated Token refresh should be done through auth/AuthenticationService.ts
   */
  async refreshToken(
    _currentToken: string
  ): Promise<AuthenticationResult | null> {
    throw new Error("Use auth/AuthenticationService.ts for token refresh");
  }

  /**
   * Sign out user
   */
  async signOut(userId: string, context?: AuditContext): Promise<void> {
    try {
      const user = await this.userRepository.findById(UserId.create(userId));
      if (!user) {
        throw new Error("User not found");
      }

      // Log sign out
      await this.auditService.logUserLogout(user, context);
    } catch (error: unknown) {
      throw new Error(
        `Sign out failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    throw new Error("Use auth/AuthenticationService.ts to get current user");
  }

  /**
   * @deprecated Auth state changes should be handled differently
   */
  onAuthStateChanged(_callback: (user: User | null) => void): () => void {
    throw new Error(
      "Auth state changes are not supported in this implementation"
    );
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: string): boolean {
    // Define role-based permissions
    const permissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ["*"], // Admin has all permissions
      [UserRole.MEMBER]: [
        "request.view",
        "request.create",
        "request.update.own",
        "request.view.own",
        "user.view.self",
      ],
      [UserRole.GUEST]: ["request.view", "user.view.self"],
    };

    const userRoles = user.getRoles();

    // Check permissions for each role
    for (const role of userRoles) {
      const rolePermissions = permissions[role] || [];

      // Check for wildcard permission
      if (rolePermissions.includes("*")) {
        return true;
      }

      // Check specific permission
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  }
}
