'use server';

import { z } from 'zod';
import { UserRepository } from '@/external/domain/user';
import { AuditService } from '@/external/service/AuditService';
import { getSession } from './auth';
import { UserRole, UserStatus } from '@/external/domain/user/user';

// Validation schemas
const getUsersSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
});

const updateUserStatusSchema = z.object({
  userId: z.string(),
  status: z.nativeEnum(UserStatus),
});

const updateUserProfileSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

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
  users?: Array<UserResponse['user']>;
  total?: number;
  limit?: number;
  offset?: number;
};

// Initialize services
const userRepository = new UserRepository();
const auditService = new AuditService();

/**
 * Get users with optional filtering
 */
export async function getUsers(data?: unknown): Promise<UserListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check permission
    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    const validated = getUsersSchema.parse(data || {});
    
    // Get all users first (in production, this would be paginated)
    let users = await userRepository.findAll();
    
    // Apply filters
    if (validated.status) {
      users = users.filter(u => u.getStatus() === validated.status);
    }
    
    if (validated.role) {
      users = users.filter(u => u.hasRole(validated.role as UserRole));
    }
    
    if (validated.search) {
      const searchLower = validated.search.toLowerCase();
      users = users.filter(u => 
        u.getName().toLowerCase().includes(searchLower) ||
        u.getEmail().getValue().toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = users.length;
    const start = validated.offset;
    const end = start + validated.limit;
    const paginatedUsers = users.slice(start, end);
    
    return {
      success: true,
      users: paginatedUsers.map(u => u.toJSON()),
      total,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get users',
    };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(data: unknown): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = updateUserRoleSchema.parse(data);
    
    // Check permission
    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }
    
    // Prevent self role change
    if (validated.userId === session.user.id) {
      return {
        success: false,
        error: 'Cannot change your own role',
      };
    }
    
    const targetUser = await userRepository.findById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    // Update role
    const currentRoles = targetUser.getRoles();
    
    // Remove all existing roles and add the new one
    currentRoles.forEach(role => targetUser.removeRole(role));
    targetUser.assignRole(validated.role);
    
    await userRepository.save(targetUser);
    
    // Log the action
    await auditService.logUserRoleChange(
      targetUser,
      currentUser,
      currentRoles,
      [validated.role],
      {
        ipAddress: 'server',
        userAgent: 'server-action',
      }
    );
    
    return {
      success: true,
      user: targetUser.toJSON(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(data: unknown): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = updateUserStatusSchema.parse(data);
    
    // Check permission
    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser || !currentUser.isAdmin()) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }
    
    // Prevent self status change
    if (validated.userId === session.user.id) {
      return {
        success: false,
        error: 'Cannot change your own status',
      };
    }
    
    const targetUser = await userRepository.findById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const previousStatus = targetUser.getStatus();
    targetUser.changeStatus(validated.status);
    
    await userRepository.save(targetUser);
    
    // Log the action
    await auditService.logAction({
      action: 'user.status.change',
      entityType: 'user',
      entityId: validated.userId,
      userId: session.user.id,
      metadata: {
        previousStatus,
        newStatus: validated.status,
      },
      context: {
        ipAddress: 'server',
        userAgent: 'server-action',
      },
    });
    
    return {
      success: true,
      user: targetUser.toJSON(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user status',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: unknown): Promise<UserResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const validated = updateUserProfileSchema.parse(data);
    
    // Users can only update their own profile, admins can update any profile
    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser) {
      return {
        success: false,
        error: 'Current user not found',
      };
    }
    
    const isAdmin = currentUser.isAdmin();
    const isSelfUpdate = validated.userId === session.user.id;
    
    if (!isSelfUpdate && !isAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }
    
    const targetUser = await userRepository.findById(validated.userId);
    if (!targetUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    targetUser.updateProfile(validated.name, validated.email);
    
    await userRepository.save(targetUser);
    
    // Log the action
    await auditService.logAction({
      action: 'user.profile.update',
      entityType: 'user',
      entityId: validated.userId,
      userId: session.user.id,
      metadata: {
        updatedFields: ['name', 'email'],
        isSelfUpdate,
      },
      context: {
        ipAddress: 'server',
        userAgent: 'server-action',
      },
    });
    
    return {
      success: true,
      user: targetUser.toJSON(),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile',
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
        error: 'Unauthorized',
      };
    }
    
    // Users can view their own profile, admins can view any profile
    const currentUser = await userRepository.findById(session.user.id);
    if (!currentUser) {
      return {
        success: false,
        error: 'Current user not found',
      };
    }
    
    const isAdmin = currentUser.isAdmin();
    const isSelfView = userId === session.user.id;
    
    if (!isSelfView && !isAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }
    
    const user = await userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    return {
      success: true,
      user: user.toJSON(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
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
        error: 'Unauthorized',
      };
    }
    
    return getUserById(session.user.id);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile',
    };
  }
}