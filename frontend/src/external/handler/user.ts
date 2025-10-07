"use server";

import { z } from "zod";
import { AuditService } from "@/external/service/AuditService";
import { UserManagementService } from "@/external/service";
import { getSession } from "./auth";
import { UserRole, UserStatus } from "@/external/domain/user/user";
import { AuditEventType } from "@/external/domain";

// Validation schemas
const getUsersSchema = z.object({
  status: z.enum(UserStatus).optional(),
  role: z.enum(UserRole).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(UserRole),
});

const updateUserStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(UserStatus),
});

const updateUserProfileSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  email: z.email(),
});

type GetUsersParams = z.input<typeof getUsersSchema>;
type UpdateUserRoleInput = z.input<typeof updateUserRoleSchema>;
type UpdateUserStatusInput = z.input<typeof updateUserStatusSchema>;
type UpdateUserProfileInput = z.input<typeof updateUserProfileSchema>;

// Response types
export type UserResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    roles: UserRole[];
    createdAt: string;
    updatedAt: string;
  };
};

export type UserListResponse = {
  success: boolean;
  error?: string;
  users?: Array<UserResponse["user"]>;
  total?: number;
  limit?: number;
  offset?: number;
};

// Initialize services
const userService = new UserManagementService();
const auditService = new AuditService();

/**
 * Get users with optional filtering
 */
export async function getUsers(
  data?: GetUsersParams
): Promise<UserListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check permission
    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    const validated = getUsersSchema.parse(data ?? {});

    const { users, total, limit, offset } =
      await userService.listUsers(validated);

    return {
      success: true,
      users: users.map((u) => u.toJSON()),
      total,
      limit,
      offset,
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
      error: error instanceof Error ? error.message : "Failed to get users",
    };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  data: UpdateUserRoleInput
): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateUserRoleSchema.parse(data);

    // Check permission
    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // Prevent self role change
    if (validated.userId === session.user.id) {
      return {
        success: false,
        error: "Cannot change your own role",
      };
    }

    const targetUser = await userService.findUserById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const previousRoles = targetUser.getRoles();
    const updatedUser = await userService.updateUserRoles(validated.userId, [
      validated.role,
    ]);

    // Log the action
    await auditService.logAction({
      action: "user.role.update",
      entityType: "USER",
      entityId: validated.userId,
      userId: session.user.id,
      metadata: {
        previousRoles,
        newRoles: updatedUser.getRoles(),
      },
      eventType: AuditEventType.USER_ROLE_ASSIGNED,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      user: updatedUser.toJSON(),
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
      error:
        error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(
  data: UpdateUserStatusInput
): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateUserStatusSchema.parse(data);

    // Check permission
    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    // Prevent self status change
    if (validated.userId === session.user.id) {
      return {
        success: false,
        error: "Cannot change your own status",
      };
    }

    const targetUser = await userService.findUserById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const previousStatus = targetUser.getStatus();
    const updatedUser = await userService.updateUserStatus(
      validated.userId,
      validated.status
    );

    // Log the action
    await auditService.logAction({
      action: "user.status.change",
      entityType: "USER",
      entityId: validated.userId,
      userId: session.user.id,
      metadata: {
        previousStatus,
        newStatus: validated.status,
      },
      eventType: AuditEventType.USER_STATUS_CHANGED,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      user: updatedUser.toJSON(),
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
      error:
        error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: UpdateUserProfileInput
): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateUserProfileSchema.parse(data);

    // Users can only update their own profile, admins can update any profile
    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser) {
      return {
        success: false,
        error: "Current user not found",
      };
    }

    const isAdmin = currentUser.isAdmin();
    const isSelfUpdate = validated.userId === session.user.id;

    if (!isSelfUpdate && !isAdmin) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    const targetUser = await userService.findUserById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const updatedFields: string[] = [];
    if (targetUser.getName() !== validated.name) {
      updatedFields.push("name");
    }
    if (targetUser.getEmail().getValue() !== validated.email) {
      updatedFields.push("email");
    }

    const updatedUser = await userService.updateUserProfile(
      validated.userId,
      validated.name,
      validated.email
    );

    // Log the action
    await auditService.logAction({
      action: "user.profile.update",
      entityType: "USER",
      entityId: validated.userId,
      userId: session.user.id,
      metadata: {
        updatedFields,
        isSelfUpdate,
      },
      eventType: AuditEventType.USER_UPDATED,
      context: {
        ipAddress: "server",
        userAgent: "server-action",
      },
    });

    return {
      success: true,
      user: updatedUser.toJSON(),
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to update user profile",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Users can view their own profile, admins can view any profile
    const currentUser = await userService.findUserById(session.user.id);
    if (!currentUser) {
      return {
        success: false,
        error: "Current user not found",
      };
    }

    const isAdmin = currentUser.isAdmin();
    const isSelfView = userId === session.user.id;

    if (!isSelfView && !isAdmin) {
      return {
        success: false,
        error: "Insufficient permissions",
      };
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: user.toJSON(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Get current user profile
 */
export async function getMyProfile(): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return getUserById(session.user.id);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get profile",
    };
  }
}
