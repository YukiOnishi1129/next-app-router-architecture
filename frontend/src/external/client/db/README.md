# Database Layer

This directory contains the database layer implementation using Drizzle ORM with PostgreSQL.

## Structure

```
db/
├── client.ts           # Database connection and client initialization
├── schema/            # Table definitions
│   ├── users.ts       # User table schema
│   ├── requests.ts    # Request table schema
│   ├── attachments.ts # Attachment table schema
│   ├── comments.ts    # Comment table schema
│   ├── audit-logs.ts  # Audit log table schema
│   ├── notifications.ts # Notification table schema
│   └── index.ts       # Schema exports
└── migrations/        # Database migrations
```

## Setup

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

## Database Commands

```bash
# Generate a new migration based on schema changes
npm run db:generate <migration-name>

# Run pending migrations
npm run db:migrate

# Push schema changes directly to the database (development only)
npm run db:push

# Open Drizzle Studio to browse the database
npm run db:studio
```

## Schema Overview

### Users Table
- Stores user information with roles and status
- Supports multiple roles per user (ADMIN, MEMBER, GUEST)
- Tracks user status (ACTIVE, INACTIVE, SUSPENDED)

### Requests Table
- Main entity for user requests
- Includes type, priority, and status tracking
- Links to requester, assignee, and reviewer users
- Supports attachment references

### Attachments Table
- File metadata storage
- Soft delete support
- Links to requests and uploaders

### Comments Table
- Comments on requests
- Supports editing and soft deletion
- Tracks comment history

### Audit Logs Table
- Comprehensive audit trail
- Tracks all system events
- Stores change history and metadata
- Immutable records

### Notifications Table
- User notifications
- Multiple notification types
- Read/unread tracking
- Related entity references