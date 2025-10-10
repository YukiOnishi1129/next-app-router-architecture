import { AccountId } from './account-id'
import { Email } from '../shared/value-objects'

/**
 * Account status enum
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Account role enum
 */
export enum AccountRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

/**
 * Account entity - represents a system account
 */
export class Account {
  private constructor(
    private readonly id: AccountId,
    private name: string,
    private email: Email,
    private status: AccountStatus,
    private roles: AccountRole[],
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(params: {
    name: string
    email: string
    roles?: AccountRole[]
  }): Account {
    const now = new Date()
    return new Account(
      AccountId.generate(),
      params.name,
      new Email(params.email),
      AccountStatus.ACTIVE,
      params.roles || [AccountRole.MEMBER],
      now,
      now
    )
  }

  static restore(params: {
    id: string
    name: string
    email: string
    status: AccountStatus
    roles: AccountRole[]
    createdAt: Date
    updatedAt: Date
  }): Account {
    return new Account(
      AccountId.create(params.id),
      params.name,
      new Email(params.email),
      params.status,
      params.roles,
      params.createdAt,
      params.updatedAt
    )
  }

  getId(): AccountId {
    return this.id
  }

  getName(): string {
    return this.name
  }

  getEmail(): Email {
    return this.email
  }

  getStatus(): AccountStatus {
    return this.status
  }

  getRoles(): AccountRole[] {
    return [...this.roles]
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt)
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt)
  }

  isActive(): boolean {
    return this.status === AccountStatus.ACTIVE
  }

  hasRole(role: AccountRole): boolean {
    return this.roles.includes(role)
  }

  isAdmin(): boolean {
    return this.hasRole(AccountRole.ADMIN)
  }

  updateProfile(name: string, email: string): void {
    this.name = name
    this.email = new Email(email)
    this.updatedAt = new Date()
  }

  changeStatus(status: AccountStatus): void {
    this.status = status
    this.updatedAt = new Date()
  }

  assignRole(role: AccountRole): void {
    if (!this.hasRole(role)) {
      this.roles.push(role)
      this.updatedAt = new Date()
    }
  }

  removeRole(role: AccountRole): void {
    const index = this.roles.indexOf(role)
    if (index > -1) {
      this.roles.splice(index, 1)
      this.updatedAt = new Date()
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
    }
  }
}
