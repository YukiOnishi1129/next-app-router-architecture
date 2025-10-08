import { UserId } from "./user-id";
import { Email } from "../shared/value-objects";

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

/**
 * User role enum
 */
export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

/**
 * User entity - represents a system user
 */
export class User {
  private constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private status: UserStatus,
    private roles: UserRole[],
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    name: string;
    email: string;
    roles?: UserRole[];
  }): User {
    const now = new Date();
    return new User(
      UserId.generate(),
      params.name,
      new Email(params.email),
      UserStatus.ACTIVE,
      params.roles || [UserRole.MEMBER],
      now,
      now
    );
  }

  static restore(params: {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    roles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      UserId.create(params.id),
      params.name,
      new Email(params.email),
      params.status,
      params.roles,
      params.createdAt,
      params.updatedAt
    );
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  getRoles(): UserRole[] {
    return [...this.roles];
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  updateProfile(name: string, email: string): void {
    this.name = name;
    this.email = new Email(email);
    this.updatedAt = new Date();
  }

  changeStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  assignRole(role: UserRole): void {
    if (!this.hasRole(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(role: UserRole): void {
    const index = this.roles.indexOf(role);
    if (index > -1) {
      this.roles.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  toJSON() {
    return {
      id: this.id.getValue(),
      name: this.name,
      email: this.email.getValue(),
      status: this.status,
      roles: this.roles,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
