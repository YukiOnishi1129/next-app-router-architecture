# Domain Model Example

This document provides an illustrative implementation of the request domain, combining entities, value objects, repositories, and application services.

---

## User Domain

```ts
// external/domain/user/types.ts
export type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST'

export interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export class User {
  constructor(private data: UserData) {}

  canApprove(): boolean {
    return this.data.role === 'ADMIN' || this.data.role === 'MEMBER'
  }

  updateProfile(name: string, email: string) {
    if (!name) throw new Error('Name is required')
    if (!email) throw new Error('Email is required')
    this.data = { ...this.data, name, email, updatedAt: new Date() }
  }
}
```

---

## Request Domain

```ts
// external/domain/request/index.ts
export class Request {
  constructor(private state: RequestState) {}

  addAttachment(attachment: Attachment) {
    if (this.state.status !== 'draft') {
      throw new Error('Attachments allowed only in draft')
    }
    if (this.state.attachments.length >= 10) {
      throw new Error('Maximum attachments exceeded')
    }
    this.state.attachments.push(attachment)
    this.touch()
  }

  submit() {
    if (this.state.status !== 'draft') {
      throw new Error('Only drafts can be submitted')
    }
    this.state.status = 'submitted'
    this.touch()
    return new RequestSubmittedEvent(this.state.id, this.state.createdBy, new Date())
  }
}
```

---

## Request Service

```ts
export class RequestService {
  constructor(
    private readonly repository: RequestRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  async create(userId: string, input: CreateRequestInput) {
    const request = Request.create({ ...input, createdBy: userId })
    await this.repository.save(request)
    await this.auditService.logRequestCreated(request)
    return request
  }

  async approve(requestId: string, approverId: string, comment?: string) {
    const request = await this.repository.findById(requestId)
    if (!request) throw new Error('Request not found')

    const events = request.approve(UserId.create(approverId), comment)
    await this.repository.save(request)

    await this.auditService.logRequestApproved(request, approverId, comment)
    await this.notificationService.notifyRequestApproved(request, comment)

    return events
  }
}
```

---

## Handler Example

```ts
// external/handler/request/command.server.ts
export async function approveRequestCommandServer(data: ApproveRequestInput) {
  try {
    const input = approveRequestSchema.parse(data)
    const events = await requestWorkflowService.approveRequest(input)
    return { success: true, events }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve request',
    }
  }
}
```

---

## Takeaways

- Keep validation and invariants inside domain classes.
- Services orchestrate aggregates and cross-cutting concerns (audit, notifications).
- Handlers focus on I/O (DTO parsing, error shaping) while delegating to services.
