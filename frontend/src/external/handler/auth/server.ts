import "server-only";

import { z } from "zod";
import { cookies } from "next/headers";
import { AuthenticationService } from "@/external/service/auth/AuthenticationService";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import {
  AuditService,
  type AuditContext,
} from "@/external/service/AuditService";

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

export type SignInInput = z.input<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type SessionInput = z.input<typeof sessionSchema>;

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

const authService = new AuthenticationService({
  apiKey: process.env.GCP_IDENTITY_PLATFORM_API_KEY!,
  projectId: process.env.GCP_PROJECT_ID!,
});

const userManagementService = new UserManagementService();
const auditService = new AuditService();

const SERVER_CONTEXT: AuditContext = {
  ipAddress: "server",
  userAgent: "server-action",
};

export async function signInServer(data: SignInInput): Promise<SignInResponse> {
  try {
    const validated = signInSchema.parse(data);

    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    );

    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    });

    await auditService.logUserLogin(user, SERVER_CONTEXT);

    const cookieStore = await cookies();

    cookieStore.set("auth-token", authResult.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    cookieStore.set("user-id", user.getId().getValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
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

export async function signUpServer(data: SignUpInput): Promise<SignUpResponse> {
  try {
    const validated = signUpSchema.parse(data);

    const authResult = await authService.signUpWithEmailPassword(
      validated.email,
      validated.password,
      validated.name
    );

    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name:
        authResult.userInfo.name ||
        validated.name ||
        validated.email.split("@")[0],
      externalId: authResult.userInfo.id,
    });

    await auditService.logUserLogin(user, SERVER_CONTEXT);

    const cookieStore = await cookies();

    cookieStore.set("auth-token", authResult.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    cookieStore.set("user-id", user.getId().getValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
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

export async function signOutServer(userId?: string): Promise<SignOutResponse> {
  try {
    const cookieStore = await cookies();
    const storedUserId = userId ?? cookieStore.get("user-id")?.value;
    const token = cookieStore.get("auth-token")?.value;

    if (!storedUserId || !token) {
      return {
        success: false,
        error: "No active session",
      };
    }

    const user = await userManagementService.findUserById(storedUserId);
    if (user) {
      try {
        await authService.revokeAuthentication(token);
      } catch (error) {
        console.error("Failed to revoke token:", error);
      }

      await auditService.logUserLogout(user, SERVER_CONTEXT);
    }

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

export async function getSessionServer(
  data?: SessionInput
): Promise<SessionResponse> {
  try {
    const validated = sessionSchema.parse(data ?? {});
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const storedUserId = cookieStore.get("user-id")?.value;

    if (!token || !storedUserId) {
      return { isAuthenticated: false };
    }

    const tokenInfo = await authService.verifyToken(token);
    if (!tokenInfo) {
      cookieStore.delete("auth-token");
      cookieStore.delete("user-id");
      return { isAuthenticated: false };
    }

    const user = await userManagementService.findUserById(storedUserId);
    if (!user) {
      return { isAuthenticated: false };
    }

    if (validated.userId && validated.userId !== user.getId().getValue()) {
      return { isAuthenticated: false };
    }

    return {
      user: userManagementService.toUserProfile(user),
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Session error:", error);
    return { isAuthenticated: false };
  }
}

export async function checkPermissionServer(
  permission: string
): Promise<boolean> {
  const session = await getSessionServer();
  if (!session.isAuthenticated || !session.user) {
    return false;
  }

  const user = await userManagementService.findUserById(session.user.id);
  if (!user) {
    return false;
  }

  return userManagementService.hasPermission(user, permission);
}
