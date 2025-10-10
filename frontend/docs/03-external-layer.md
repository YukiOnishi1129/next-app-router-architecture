# External Layer Design

## Overview

The external layer hosts code that must run **only on the server**: database access, Identity Platform calls, third-party integrations, and other side effects. It keeps client bundles lean and provides a clear boundary between domain/app logic and infrastructure concerns.

## Design Principles

1. **Enforce `server-only`** – Files such as `command.server.ts`, `query.server.ts`, and anything in `service/**` begin with `import 'server-only'`. A custom ESLint rule (`require-server-only`) ensures compliance.
2. **Share contracts via DTOs** – Zod schemas and TypeScript types live in `external/dto/**`. Handlers import DTOs for validation and response typing; Server Actions (when present) reuse the same DTOs. Importing types directly from `*.action.ts` triggers `restrict-action-imports`.
3. **CQRS-style separation** – Commands and queries live in separate modules. Auth handlers are invoked directly by NextAuth and therefore skip `.action.ts`, whereas other domains expose Server Actions alongside server modules.

```text
external/
├── dto/                    # DTOs & Zod schemas
├── handler/
│   ├── auth/
│   │   ├── shared.ts
│   │   ├── command.server.ts
│   │   ├── query.server.ts
│   │   └── token.server.ts
│   └── request/
│       ├── command.server.ts
│       ├── command.action.ts
│       ├── query.server.ts
│       └── query.action.ts
├── service/
├── repository/
└── client/
```

## Handler Pattern

| File               | Responsibility |
|--------------------|----------------|
| `command.server.ts`| Server-only command implementation (validation + services) |
| `command.action.ts`| Server Action wrapper for commands (non-auth domains) |
| `query.server.ts`  | Server-only query implementation |
| `query.action.ts`  | Server Action wrapper for queries (non-auth domains) |
| `shared.ts`        | Service wiring, DTO mappers, shared utilities |
| `token.server.ts`  | Auth-specific helpers (refreshing ID tokens, cookie helpers) |

### Example: `loginCommandServer`

```ts
import 'server-only'
import { ZodError } from 'zod'

import {
  setIdTokenCookieServer,
  setRefreshTokenCookieServer,
} from '@/features/auth/servers/token.server'
import {
  signInCommandSchema,
  type SignInCommandRequest,
  type SignInCommandResponse,
} from '@/external/dto/auth'
import {
  authService,
  userManagementService,
  auditService,
  SERVER_CONTEXT,
} from './shared'

export async function loginCommandServer(
  data: SignInCommandRequest
): Promise<SignInCommandResponse> {
  try {
    const validated = signInCommandSchema.parse(data)
    const authResult = await authService.signInWithEmailPassword(
      validated.email,
      validated.password
    )

    const user = await userManagementService.getOrCreateUser({
      email: authResult.userInfo.email,
      name: authResult.userInfo.name,
      externalId: authResult.userInfo.id,
    })

    await auditService.logUserLogin(user, SERVER_CONTEXT)

    await Promise.all([
      setRefreshTokenCookieServer(authResult.refreshToken),
      setIdTokenCookieServer(authResult.idToken),
    ])

    return {
      success: true,
      user: userManagementService.toAccountProfile(user),
      idToken: authResult.idToken,
      refreshToken: authResult.refreshToken,
      redirectUrl: validated.redirectUrl ?? '/dashboard',
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid email or password format' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}
```

## Layer Interaction

```
Client Component / Server Component
    ↓ (Server Action invocation)
external/handler/**/command.action.ts
    ↓
external/handler/**/command.server.ts
    ↓
external/service/** (domain logic)
    ↓
external/repository/** (persistence)
```

- Server Actions return DTO-shaped payloads so callers stay type-safe.
- Handlers remain thin; domain logic lives in services, not handlers.
- Sharing DTOs keeps Server Actions, handlers, and tests in sync.

## Testing Guidelines

- **Handlers**: assert DTO validation behaviour and error propagation (`ZodError`).
- **Services**: unit test business rules in isolation.
- **Repositories**: integration tests with mocked `db` or a temporary database.
- **External clients**: mock fetch/HTTP calls, verify retries and failure paths.

## Security Notes

1. Validate required environment variables via Zod; never hardcode secrets.
2. Always parse incoming payloads with the appropriate DTO schema before touching services.
3. Return `{ success: false, error }` objects on failure—avoid leaking stack traces to consumers.

## Summary

- The external layer stays server-only and type-safe via DTOs.
- Commands/queries follow clear naming conventions (`verbResourceServer`).
- Custom ESLint rules (`require-server-only`, `restrict-action-imports`) enforce the architecture in CI.
