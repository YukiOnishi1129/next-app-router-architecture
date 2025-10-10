# Types & Schemas

This document explains how we approach type safety with **TypeScript** and **Zod**. The goal is a single source of truth for validation that feeds both client and server code.

---

## Philosophy

1. **Schema first** – Describe inputs with Zod, derive TypeScript types via `z.infer`, and reuse the schema in server handlers.
2. **Typed DTOs** – Data crossing the external layer boundary must be represented by DTOs (`external/dto/**`).
3. **Value objects** – Model opaque IDs and domain concepts as branded types to prevent cross-wiring.
4. **Runtime validation** – Every external-facing entry point re-parses input (Server Actions, handlers, route handlers).

---

## Directory Structure

```
shared/types/          # Global/shared types
  ├── api.ts          # Generic API response helpers
  ├── auth.ts         # NextAuth session/account shapes
  └── common.ts       # Utility types (Result, Nullable, etc.)
features/
  └── accounts/
      ├── types/      # Feature-specific types
      └── schemas/    # Zod schemas, reused on server
external/
  └── dto/            # Contracts for external handlers/services
```

---

## Example: Account Schema

```ts
// features/accounts/schemas/account.ts
import { z } from 'zod'

export const accountSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'MEMBER', 'GUEST']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Account = z.infer<typeof accountSchema>

export const createAccountSchema = accountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>
```

---

## Identity Platform DTOs

```ts
// external/dto/auth/auth.command.dto.ts
import { z } from 'zod'

export const signInCommandSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  redirectUrl: z.string().min(1).optional(),
})

export type SignInCommandRequest = z.infer<typeof signInCommandSchema>
export type SignInCommandResponse = {
  success: boolean
  error?: string
  account?: Account
  idToken?: string
  refreshToken?: string
  redirectUrl?: Route
}
```

The same schema is reused inside `loginCommandServer` for server-side validation.

---

## API Response Helpers

```ts
// shared/types/api.ts
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiError
```

---

## Branded Types

```ts
// shared/types/brand.ts
export type Brand<T, U extends string> = T & { readonly __brand: U }
export type AccountId = Brand<string, 'AccountId'>
export type RequestId = Brand<string, 'RequestId'>

const toAccountId = (value: string): AccountId => value as AccountId
```

Branded IDs ensure a `AccountId` is never passed where a `RequestId` is expected.

---

## Utility Types

```ts
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export type Nullable<T> = T | null
```

---

## Database Integration

```ts
// external/repository/db/AccountRepository.ts
import { db } from '@/external/client/db/client'
import { users } from '@/external/client/db/schema'

export class AccountRepository {
  async findById(id: AccountId): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id))
    // map to domain entity...
  }
}
```

Drizzle types flow through to DTOs, ensuring the repository layer remains type-safe.

---

## Best Practices

- [ ] Define schemas once, reuse everywhere (client, server, tests).
- [ ] Export both `schema` and inferred `type` from the same module.
- [ ] Use discriminated unions for multi-state responses (`success`/`error`).
- [ ] Avoid `any`/`unknown` unless absolutely necessary; narrow types early.
- [ ] Validate environment variables at boot using Zod (`envSchema.parse`).
