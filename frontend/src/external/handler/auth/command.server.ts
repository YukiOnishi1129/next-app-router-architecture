import "server-only";

import { z } from "zod";
import { cookies } from "next/headers";
import {
  authService,
  userManagementService,
  auditService,
  SERVER_CONTEXT,
} from "./shared";

const createSessionSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirectUrl: z.string().url().optional(),
});

const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  redirectUrl: z.string().url().optional(),
});

export type CreateSessionInput = z.input<typeof createSessionSchema>;
export type CreateUserInput = z.input<typeof createUserSchema>;

export type CreateSessionResponse = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export type CreateUserResponse = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export type DeleteSessionResponse = {
  success: boolean;
  error?: string;
};

export async function createSessionServer(
  data: CreateSessionInput
): Promise<CreateSessionResponse> {
  try {
    const validated = createSessionSchema.parse(data);

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

export async function createUserServer(
  data: CreateUserInput
): Promise<CreateUserResponse> {
  try {
    const validated = createUserSchema.parse(data);

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

export async function deleteSessionServer(
  userId?: string
): Promise<DeleteSessionResponse> {
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
