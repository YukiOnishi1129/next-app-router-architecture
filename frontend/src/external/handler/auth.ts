"use server";

import { z } from "zod";
import { AuthenticationService } from "@/external/service/auth/AuthenticationService";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import { AuditService, AuditContext } from "@/external/service/AuditService";
import { cookies } from "next/headers";

// Validation schemas
const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: z.url().optional(),
});

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  redirectUrl: z.url().optional(),
});

const sessionSchema = z.object({
  userId: z.string().optional(),
});

type SignInInput = z.input<typeof signInSchema>;
type SignUpInput = z.input<typeof signUpSchema>;
type SessionInput = z.input<typeof sessionSchema>;

// Response types
export type SignInResponse = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export type SignUpResponse = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export type SignOutResponse = {
  success: boolean;
  error?: string;
};

export type SessionResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    status: string;
    roles: string[];
  };
  isAuthenticated: boolean;
};

// Initialize services
const authService = new AuthenticationService({
  apiKey: process.env.GCP_IDENTITY_PLATFORM_API_KEY!,
  projectId: process.env.GCP_PROJECT_ID!,
});

const userManagementService = new UserManagementService();
const auditService = new AuditService();

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInInput): Promise<SignInResponse> {
  try {
    const validated = signInSchema.parse(data);

    // Authenticate with email/password
    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    );

    // Get or create user in our system
    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    });

    // Log authentication
    const auditContext: AuditContext = {
      ipAddress: "server",
      userAgent: "server-action",
    };
    await auditService.logUserLogin(user, auditContext);

    // Store auth tokens in secure cookies
    const cookieStore = await cookies();

    // Store ID token (no refresh token for short sessions)
    cookieStore.set("auth-token", authResult.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day for short sessions
      path: "/",
    });

    // Store user ID for quick lookups
    cookieStore.set("user-id", user.getId().getValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return {
      success: true,
      redirectUrl: validated.redirectUrl || "/dashboard",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid email or password format",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(data: SignUpInput): Promise<SignUpResponse> {
  try {
    const validated = signUpSchema.parse(data);

    // Sign up with email/password
    const authResult = await authService.signUpWithEmailPassword(
      validated.email,
      validated.password,
      validated.name
    );

    // Create user in our system
    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name:
        authResult.userInfo.name ||
        validated.name ||
        validated.email.split("@")[0],
      externalId: authResult.userInfo.id,
    });

    // Log user creation
    const auditContext: AuditContext = {
      ipAddress: "server",
      userAgent: "server-action",
    };
    await auditService.logUserLogin(user, auditContext);

    // Store auth tokens in secure cookies
    const cookieStore = await cookies();

    // Store ID token (no refresh token for short sessions)
    cookieStore.set("auth-token", authResult.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day for short sessions
      path: "/",
    });

    // Store user ID for quick lookups
    cookieStore.set("user-id", user.getId().getValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return {
      success: true,
      redirectUrl: validated.redirectUrl || "/dashboard",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<SignOutResponse> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user-id")?.value;
    const token = cookieStore.get("auth-token")?.value;

    if (!userId || !token) {
      return {
        success: false,
        error: "No active session",
      };
    }

    // Get user for audit logging
    const user = await userManagementService.findUserById(userId);
    if (user) {
      // Revoke authentication (optional, depends on implementation)
      try {
        await authService.revokeAuthentication(token);
      } catch (error) {
        // Log error but continue with sign out
        console.error("Failed to revoke token:", error);
      }

      // Log sign out
      const auditContext: AuditContext = {
        ipAddress: "server",
        userAgent: "server-action",
      };
      await auditService.logUserLogout(user, auditContext);
    }

    // Clear auth cookies
    cookieStore.delete("auth-token");
    cookieStore.delete("user-id");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
}

/**
 * Get current session
 */
export async function getSession(
  data?: SessionInput
): Promise<SessionResponse> {
  try {
    const validated = sessionSchema.parse(data ?? {});
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const storedUserId = cookieStore.get("user-id")?.value;

    if (!token || !storedUserId) {
      return {
        isAuthenticated: false,
      };
    }

    // Verify token is still valid
    const tokenInfo = await authService.verifyToken(token);
    if (!tokenInfo) {
      // Token is invalid, clear cookies
      cookieStore.delete("auth-token");
      cookieStore.delete("user-id");

      return {
        isAuthenticated: false,
      };
    }

    // Get user from database
    const user = await userManagementService.findUserById(storedUserId);
    if (!user) {
      return {
        isAuthenticated: false,
      };
    }

    // If userId is provided, verify it matches the authenticated user
    if (validated.userId && validated.userId !== user.getId().getValue()) {
      return {
        isAuthenticated: false,
      };
    }

    return {
      user: userManagementService.toUserProfile(user),
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Session error:", error);
    return {
      isAuthenticated: false,
    };
  }
}

/**
 * Check if user has permission
 */
export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return false;
    }

    const user = await userManagementService.findUserById(session.user.id);
    if (!user) {
      return false;
    }

    return userManagementService.hasPermission(user, permission);
  } catch {
    return false;
  }
}
