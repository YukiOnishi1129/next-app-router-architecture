# Data Model

## Entities
- Account(id, name, role: requester|approver|admin, createdAt, updatedAt)
- Request(id, type, title, amount?, reason, status, createdBy, approverId?, createdAt, updatedAt)
- Attachment(id, requestId, url, filename, createdAt)
- Comment(id, requestId, userId, body, createdAt)
- AuditLog(id, actorId, targetType, targetId, action, payload?, createdAt)

## Status Machine
draft → submitted → approved | rejected
(Reopen not supported in the current scope; can be added later.)
