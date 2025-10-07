/**
 * User Management Service
 *
 * This service handles user database operations only.
 * It does not make any external API calls.
 */

import { User, UserId, Email, UserRole, UserStatus } from "@/external/domain";
import { UserRepository } from "@/external/repository/UserRepository";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  roles: UserRole[];
}

export interface CreateUserData {
  email: string;
  name: string;
  externalId?: string;
  roles?: UserRole[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  status?: UserStatus;
  roles?: UserRole[];
}

export interface ListUsersParams {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  limit?: number;
  offset?: number;
}

export class UserManagementService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(UserId.create(userId));
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(new Email(email));
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      new Email(data.email)
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const user = User.create({
      name: data.name,
      email: data.email,
      roles: data.roles || [UserRole.MEMBER],
    });

    // Save to database
    await this.userRepository.save(user);
    return user;
  }

  /**
   * List users with optional filtering and pagination
   */
  async listUsers(params: ListUsersParams = {}): Promise<{
    users: User[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { status, role, search, limit, offset } = params;
    const allUsers = await this.userRepository.findAll();

    const filtered = allUsers.filter((user) => {
      if (status && user.getStatus() !== status) {
        return false;
      }
      if (role && !user.hasRole(role)) {
        return false;
      }
      if (search) {
        const query = search.toLowerCase();
        const matchesName = user.getName().toLowerCase().includes(query);
        const matchesEmail = user
          .getEmail()
          .getValue()
          .toLowerCase()
          .includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }
      return true;
    });

    const total = filtered.length;
    const start = offset ?? 0;
    const pageSize = limit ?? total;
    const paginated =
      pageSize === total && start === 0
        ? filtered
        : filtered.slice(start, start + pageSize);

    return {
      users: paginated,
      total,
      limit: pageSize,
      offset: start,
    };
  }

  /**
   * Update existing user
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Update profile if name or email changed
    if (data.name || data.email) {
      user.updateProfile(
        data.name || user.getName(),
        data.email || user.getEmail().getValue()
      );
    }

    // Update status if changed
    if (data.status && data.status !== user.getStatus()) {
      user.changeStatus(data.status);
    }

    // Update roles if changed
    if (data.roles) {
      // Remove all current roles
      const currentRoles = user.getRoles();
      currentRoles.forEach((role) => user.removeRole(role));

      // Add new roles
      data.roles.forEach((role) => user.assignRole(role));
    }

    // Save changes
    await this.userRepository.save(user);
    return user;
  }

  /**
   * Get or create user
   */
  async getOrCreateUser(data: CreateUserData): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      new Email(data.email)
    );

    if (existingUser) {
      // Update user info if needed
      if (existingUser.getName() !== data.name) {
        existingUser.updateProfile(
          data.name,
          existingUser.getEmail().getValue()
        );
        await this.userRepository.save(existingUser);
      }
      return existingUser;
    }

    return this.createUser(data);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(user.getId());
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    return this.updateUser(userId, { roles });
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return this.updateUser(userId, { status });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    name: string,
    email: string
  ): Promise<User> {
    return this.updateUser(userId, { name, email });
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: User, permission: string): boolean {
    const permissions = this.getPermissionsForRoles(user.getRoles());
    return permissions.includes("*") || permissions.includes(permission);
  }

  /**
   * Get permissions for user
   */
  getUserPermissions(user: User): string[] {
    return this.getPermissionsForRoles(user.getRoles());
  }

  /**
   * Convert user to profile
   */
  toUserProfile(user: User): UserProfile {
    return {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      status: user.getStatus(),
      roles: user.getRoles(),
    };
  }

  /**
   * Get permissions for roles
   */
  private getPermissionsForRoles(roles: UserRole[]): string[] {
    const permissionMap: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ["*"], // Admin has all permissions
      [UserRole.MEMBER]: [
        "request.view",
        "request.create",
        "request.update.own",
        "request.view.own",
        "user.view.self",
        "user.update.self",
      ],
      [UserRole.GUEST]: ["request.view", "user.view.self"],
    };

    const allPermissions = new Set<string>();

    roles.forEach((role) => {
      const rolePermissions = permissionMap[role] || [];
      rolePermissions.forEach((permission) => allPermissions.add(permission));
    });

    return Array.from(allPermissions);
  }
}
