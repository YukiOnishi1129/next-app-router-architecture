# UI Component Guidelines

This guide captures the conventions we follow when building UI in the Request & Approval System. We lean on **Shadcn UI** for primitives and apply a strict Container/Presenter split for feature components.

---

## Using Shadcn UI

Shadcn UI is a Tailwind + Radix-based component library.

### Setup

```bash
pnpm dlx shadcn-ui@latest init
pnpm dlx shadcn-ui@latest add button form dialog
```

### File Organisation

```
shared/components/
├── ui/                             # Low-level primitives (button, input, card)
├── layout/
│   ├── server/                     # Server-only layout wrappers
│   └── client/                     # Client-only layout components
└── feedback/                       # Cross-cutting UI (toasts, skeletons, empty states)
```

### Server Components and `server-only`

- Files under `features/**/components/server/**` are server-only by location; no explicit `import 'server-only'` needed.
- Shared helpers under `features/**/servers/**` and `external/**` **must** declare `import 'server-only'`.

---

## Component Principles

### 1. Composition first

```tsx
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

const STATUS_VARIANT: Record<RequestStatus, ComponentProps<typeof Badge>['variant']> = {
  draft: 'outline',
  submitted: 'default',
  approved: 'success',
  rejected: 'destructive',
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
}
```

### 2. Type-safe props

```tsx
type RequestSummaryCardProps = {
  request: RequestSummary
  onSelect: (id: string) => void
}

export function RequestSummaryCard({ request, onSelect }: RequestSummaryCardProps) {
  return (
    <Card role="button" onClick={() => onSelect(request.id)}>
      <CardHeader className="flex items-start justify-between">
        <CardTitle>{request.title}</CardTitle>
        <RequestStatusBadge status={request.status} />
      </CardHeader>
      <CardContent>{request.reason}</CardContent>
    </Card>
  )
}
```

### 3. Container / Presenter pattern

Client components follow a three-layer structure: container, presenter, hook. Containers orchestrate state and data fetching; presenters remain declarative.

```tsx
// Container
export function ApprovalDecisionFormContainer({ requestId }: Props) {
  const props = useApprovalDecisionForm({ requestId })
  return <ApprovalDecisionFormPresenter {...props} />
}
```

---

## Accessibility

- Always associate labels with inputs (`htmlFor` + `id`).
- Use `aria-invalid`, `aria-describedby` for validation messaging.
- Prefer semantic elements (`button`, `nav`, `main`).

---

## Advanced Patterns

### Data tables

- Keep table data in TanStack Query caches.
- Push sorting/pagination logic into hooks (`useRequestListQuery`).
- Use sticky headers + responsive wrappers to keep tables usable on smaller viewports.

### Modals & dialogs

- Gate all modal state behind hooks (`useDisclosure`).
- Provide keyboard shortcuts (`Esc` to close) via Radix primitives.
- Ensure focus management: move focus into the dialog on open and restore on close.

### Skeleton loading

Provide suspense fallbacks for long-running server components.

```tsx
export function RequestListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
```

### Responsive design

- Use Tailwind breakpoints (`md`, `lg`) sparingly; prefer fluid layouts.
- Extract repeated responsive behaviour into utilities/components.

---

## Theming

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/shared/components/common/ThemeProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Best Practices Checklist

- [ ] Each component has a single responsibility.
- [ ] Props are typed explicitly.
- [ ] Components are accessible (labels, keyboard nav, ARIA).
- [ ] Performance optimisations (`memo`, `useMemo`, `useCallback`) applied when needed.
- [ ] Errors surfaced via dedicated states/UI; do not swallow exceptions silently.
