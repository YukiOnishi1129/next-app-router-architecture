/**
 * Request status enum
 */
export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Request priority enum
 */
export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Request type enum
 */
export enum RequestType {
  LEAVE = 'LEAVE',
  EQUIPMENT = 'EQUIPMENT',
  EXPENSE = 'EXPENSE',
  ACCESS = 'ACCESS',
  OTHER = 'OTHER',
}