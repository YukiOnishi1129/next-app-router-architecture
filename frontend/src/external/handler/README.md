# Handler Layer (Server Actions)

This directory contains Server Actions that provide the interface between the frontend UI and the backend services. All handlers use Next.js Server Actions with the `'use server'` directive.

## Overview

The handler layer is responsible for:

- Input validation using Zod schemas
- Authentication and authorization checks
- Calling appropriate services from the service layer
- Error handling and response formatting
- Audit logging

## Structure

```
handler/
├── auth.ts         # Authentication handlers
├── request.ts      # Request management handlers
├── account.ts      # Account management handlers
├── comment.ts      # Comment handlers
├── attachment.ts   # File attachment handlers
├── notification.ts # Notification handlers
└── index.ts        # Barrel export
```

## Handler Categories

### Authentication (`auth.ts`)

- `signIn` - Sign in with OAuth providers (Google)
- `signOut` - Sign out current user
- `getSession` - Get current user session
- `checkPermission` - Check if user has specific permission

### Request Management (`request.ts`)

- `createRequest` - Create a new request
- `updateRequest` - Update existing request
- `submitRequest` - Submit request for approval
- `reviewRequest` - Start reviewing a request
- `approveRequest` - Approve a request
- `rejectRequest` - Reject a request with reason
- `cancelRequest` - Cancel a request
- `assignRequest` - Assign request to a user
- `getMyRequests` - Get current user's requests
- `getAssignedRequests` - Get requests assigned to user
- `getAllRequests` - Get all requests (admin only)

### User Management (`user.ts`)

- `getUsers` - Get users with filtering (admin only)
- `getUserById` - Get specific user details
- `getMyProfile` - Get current user profile
- `updateAccountRole` - Update user role (admin only)
- `updateAccountStatus` - Update user status (admin only)
- `updateAccountProfile` - Update user profile

### Comments (`comment.ts`)

- `addComment` - Add comment to request
- `updateComment` - Update existing comment
- `deleteComment` - Delete comment
- `getComments` - Get comments for request
- `getCommentThread` - Get comment with replies

### Attachments (`attachment.ts`)

- `uploadAttachment` - Upload file to request
- `deleteAttachment` - Delete attachment
- `getAttachments` - Get request attachments
- `downloadAttachment` - Download attachment file

### Notifications (`notification.ts`)

- `getNotifications` - Get user notifications
- `markNotificationAsRead` - Mark as read
- `markAllNotificationsAsRead` - Mark all as read
- `getNotificationPreferences` - Get preferences
- `updateNotificationPreferences` - Update preferences
- `sendTestNotification` - Send test (admin only)

## Usage Example

```typescript
// In a React component
import { createRequest } from '@/external/handler';

export function CreateRequestForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createRequest({
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      priority: formData.get('priority'),
    });

    if (result.success) {
      // Handle success
      console.log('Request created:', result.request);
    } else {
      // Handle error
      console.error('Error:', result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Security

All handlers implement the following security measures:

1. **Authentication**: Every handler checks for valid session
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schemas validate all inputs
4. **Audit Logging**: All actions are logged
5. **Error Handling**: Sensitive errors are not exposed

## Response Types

All handlers return typed responses:

```typescript
type Response = {
  success: boolean;
  error?: string;
  data?: T; // Specific to each handler
}
```

## Testing

When testing handlers:

1. Mock the service layer dependencies
2. Test validation logic
3. Test authorization checks
4. Test error scenarios
5. Verify audit logging

## Best Practices

1. Always validate input with Zod
2. Check authentication first
3. Verify permissions before operations
4. Log all significant actions
5. Return consistent response formats
6. Handle errors gracefully
7. Never expose sensitive information
