# Tech Stack Overview

## Frontend Framework

### Next.js 15 (App Router)

- **Server Components**: Default to server-side rendering
- **Server Actions**: Form handling and data mutations
- **Streaming**: Progressive rendering for faster TTFB
- **Route Handlers**: Lightweight API endpoints when required

## Data Fetching

### TanStack Query (React Query)

Client-side caching and request orchestration.

```typescript
// features/requests/queries/useRequestList.ts
import { useQuery } from '@tanstack/react-query'
import { listRequestsAction } from '@/external/handler/request/query.action'
import { requestFilterSchema } from '@/features/requests/schemas/requestFilter'

export const useRequestList = (rawFilters: unknown) => {
  const filters = requestFilterSchema.parse(rawFilters)
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: () => listRequestsAction(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

### Cache Strategy

- **Stale While Revalidate**: keep data warm while fetching in the background
- **Optimistic updates** for snappy UX
- **Prefetch** data ahead of navigation (`prefetchQuery` + `HydrationBoundary`)

## Form Management

### React Hook Form + Zod

Type-safe validation and minimal re-rendering.

```typescript
// features/requests/schemas/createRequest.ts
import { z } from 'zod'

export const createRequestSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(['expense', 'purchase', 'access']),
  amount: z
    .union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?$/)])
    .optional()
    .transform(value => (typeof value === 'string' ? Number(value) : value)),
  reason: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(10),
  approverId: z.string().uuid(),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
```

```typescript
// features/requests/components/client/RequestForm/RequestFormContainer.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createRequestSchema,
  type CreateRequestInput,
} from '@/features/requests/schemas/createRequest'
import { createRequestAction } from '@/features/requests/actions/createRequest.action'
import { RequestFormPresenter } from './RequestFormPresenter'

export function RequestFormContainer() {
  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      type: 'expense',
      amount: undefined,
      reason: '',
      attachments: [],
      approverId: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await createRequestAction(data)
  })

  return <RequestFormPresenter form={form} onSubmit={handleSubmit} />
}
```

## UI Components

### Shadcn UI

- **Customisable** thanks to Tailwind
- **Accessible** out of the box (Radix primitives)
- **Strongly typed** with TypeScript

```typescript
// shared/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
```

## Database

### PostgreSQL + Drizzle ORM

Type-safe database access with schema-first tables.

```typescript
// external/client/db/schema/requests.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core'

export const requests = pgTable('requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  type: text('type').notNull(), // expense | purchase | access
  amount: numeric('amount'),
  reason: text('reason').notNull(),
  attachments: jsonb('attachments').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('draft'),
  requesterId: uuid('requester_id').notNull(),
  approverId: uuid('approver_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// external/client/db/client.ts
import 'server-only'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })
```

## Tooling

### ESLint + Prettier

- **Code quality**: ESLint enforces project-wide consistency
- **Formatting**: Prettier runs on save
- **VS Code integration**: `eslint` + `prettier` extensions shipped in workspace

### TypeScript

- **Strict mode**: maximises compiler safety
- **Path aliases** (`@/`): clean imports
- **Inference first**: prefer inferred types, surface explicit ones at module boundaries
