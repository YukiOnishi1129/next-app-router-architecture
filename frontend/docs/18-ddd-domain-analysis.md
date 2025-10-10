# DDD Domain Analysis – Request Management

This document summarises the domain model for the Request & Approval System, using Domain-Driven Design terminology. It supplements the code in `external/domain/**`.

---

## Core Entities

- ### Account

- Identified by `AccountId` (UUID)
- Attributes: name, email, roles (`ADMIN`, `MEMBER`, `GUEST`), status, created/updated timestamps
- Behaviours:
  - `canApproveRequest()` → true when role includes `ADMIN` or `MEMBER` with approver rights
  - `assignRole`, `removeRole`, `changeStatus`
  - Equality based on `AccountId`

### Request (Aggregate Root)

- Attributes: title, type (`expense`, `purchase`, `access`), optional amount, reason, status, attachments, comments
- Status transitions: `draft → submitted → approved | rejected`
- Rules:
  - Attachments limited to 10 items, only modifiable in `draft`
  - `submit()` validates mandatory fields
  - `approve()`/`reject()` require `submitted` status, produce domain events

### Attachment / Comment

- Attachments: id, filename, URL, createdAt, owned by Request aggregate
- Comments: id, body, author, createdAt; can be system-generated on approval/rejection

### AuditLog

- Records actor, target type/id, action, optional payload, timestamp
- Used for compliance trails (create/update/approve/reject etc.)

---

## Value Objects

- `AccountId`, `RequestId` – branded strings to prevent misuse
- `Email`, `Money`, `RequestType`, `RequestStatus`
- Rules enforced inside constructors (e.g., valid email format, non-negative amounts)

---

## Domain Events

- `RequestSubmittedEvent`
- `RequestApprovedEvent`
- `RequestRejectedEvent`

Events carry aggregate id, actor, timestamp, and payload (e.g., rejection reason). They feed the audit log and notification services.

---

## Repositories (Interfaces)

```ts
export interface RequestRepository {
  findById(id: RequestId): Promise<RequestAggregate | null>
  findByCreatedBy(accountId: AccountId): Promise<RequestAggregate[]>
  findPendingApprovals(): Promise<RequestAggregate[]>
  save(request: RequestAggregate): Promise<void>
}
```

Concrete implementations live under `external/repository/db` and rely on Drizzle ORM.

---

## Application Services

Examples:

- `RequestWorkflowService` – orchestrates submit/approve/reject operations, emits domain events, triggers notifications.
- `AccountManagementService` – hydrates accounts from the database, manages roles, calculates permissions.

Services depend on repositories and domain entities; they do not manipulate raw database records directly.

---

## Aggregates and Invariants

### Request Aggregate

```ts
class Request {
  submit() {
    if (this.status !== 'draft') throw new Error('Already submitted')
    if (!this.reason) throw new Error('Reason is required')
    this.status = 'submitted'
    this.updatedAt = new Date()
    return new RequestSubmittedEvent(this.id, this.createdBy, new Date())
  }

  approve(approver: AccountId, comment?: string) {
    if (this.status !== 'submitted') throw new Error('Cannot approve')
    this.status = 'approved'
    this.approverId = approver
    this.updatedAt = new Date()
    // persist optional comment, emit event
  }
}
```

Invariants—maximum attachments, comment length, valid transitions—are enforced inside the aggregate so they cannot be bypassed by services or repositories.

---

## Bounded Context Summary

- **Identity Context**: user onboarding, roles, permissions
- **Request Context**: request lifecycle, approvals, comments, attachments
- **Audit Context**: audit trail generation

Each context exposes repositories/services under `external/**` while feature-layer code consumes DTOs and hooks.

---

## Testing the Domain

- Unit test domain entities for invariants (e.g., `Request.approve` throws when status is not `submitted`).
- Mock repositories when testing services to keep tests fast.
- Integration tests at the handler level ensure DTO validation + service orchestration works end-to-end.

---

## Key Takeaways

- Keep invariants inside aggregates to avoid duplication.
- Use value objects to encode domain concepts (IDs, money, status).
- Emit domain events for workflow transitions and audit logging.
- Repositories provide a clean interface between domain logic and persistence.
