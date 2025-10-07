# Authentication Architecture

This directory contains the refactored authentication services with proper separation of concerns.

## Architecture Overview

The authentication system is split into distinct services, each with a single responsibility:

### 1. Google Identity Platform Client (`/external/client/gcp/identity-platform.ts`)
- Direct REST API client for Google Identity Platform
- No Firebase SDK dependencies
- Handles all external API calls to Google's authentication services
- Methods:
  - OAuth2 flow (authorization URL generation, code exchange)
  - ID token operations (sign-in, verification, refresh)
  - User information retrieval

### 2. AuthenticationService (`AuthenticationService.ts`)
- Handles authentication logic only
- Delegates to Google Identity Platform client for external calls
- No database operations
- Responsibilities:
  - Google OAuth authentication flow
  - Token verification and refresh
  - Authentication revocation

### 3. UserManagementService (`UserManagementService.ts`)
- Handles all user database operations
- No external API calls
- Responsibilities:
  - User CRUD operations
  - Permission management
  - User profile management

### 4. Handler (`/external/handler/auth.ts`)
- Coordinates between services
- Server actions for authentication
- Cookie management
- Audit logging

## Data Flow

1. **Sign In Flow**:
   ```
   Handler -> AuthenticationService -> Google Identity Platform Client -> Google APIs
           -> UserManagementService -> UserRepository -> Database
           -> AuditService -> AuditLogRepository -> Database
   ```

2. **Session Management**:
   ```
   Handler -> AuthenticationService (verify token)
           -> UserManagementService (get user data)
   ```

## Environment Variables

Required environment variables:

```env
# Google Identity Platform
GCP_API_KEY=your-gcp-api-key
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Application
NEXTAUTH_URL=http://localhost:3000
```

## Key Principles

1. **Separation of Concerns**: Each service has a single, well-defined responsibility
2. **No Mixed Operations**: Services either make external calls OR database operations, never both
3. **Handler Coordination**: The handler is the only place where multiple services are orchestrated
4. **Type Safety**: All operations are strongly typed with TypeScript
5. **Error Handling**: Each layer handles its own errors appropriately

## Migration Notes

This architecture replaces the previous Firebase-based authentication with direct Google Identity Platform REST API calls. The main benefits are:
- Better separation of concerns
- Easier testing and mocking
- More control over the authentication flow
- No dependency on Firebase SDK