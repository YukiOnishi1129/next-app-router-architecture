# Repository Layer

This directory contains the repository implementations that bridge the domain layer with the database layer using Drizzle ORM.

## Overview

The repository layer implements the repository interfaces defined in the domain layer, providing concrete implementations for data persistence using PostgreSQL through Drizzle ORM.

## Repositories

### AccountRepository

- Implements `AccountRepository` interface from domain
- Handles user persistence and retrieval
- Supports finding users by email and IDs

### RequestRepository

- Implements `RequestRepository` interface from domain
- Manages request lifecycle persistence
- Supports complex queries by status, requester, and assignee
- Handles domain events clearing after save

### AttachmentRepository

- Implements `AttachmentRepository` interface from domain
- Manages file attachment metadata
- Supports soft deletion
- Provides bulk operations by request ID

### CommentRepository

- Implements `CommentRepository` interface from domain
- Handles comment persistence with soft delete
- Supports pagination for comments

### AuditLogRepository

- Implements `AuditLogRepository` interface from domain
- Creates immutable audit records
- Supports complex filtering and querying
- Maps between domain events and database actions

### NotificationRepository

- Implements `NotificationRepository` interface from domain
- Manages user notifications
- Supports bulk read operations
- Provides filtering by type and read status

## Key Features

1. **Domain-Database Mapping**: Each repository handles the conversion between domain entities and database records
2. **Transaction Support**: Repositories can be extended to support database transactions
3. **Soft Deletes**: Attachments and comments support soft deletion
4. **Query Optimization**: Uses Drizzle's query builder for efficient database operations
5. **Type Safety**: Full TypeScript support with Drizzle's type inference

## Usage Example

```typescript
import { AccountRepository } from "@/external/repository";
import { Email } from "@/external/domain";

const userRepository = new AccountRepository();

// Find user by email
const user = await userRepository.findByEmail(new Email("user@example.com"));

// Save user
await userRepository.save(user);
```
