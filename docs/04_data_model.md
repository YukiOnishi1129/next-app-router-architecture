# Data Model

## Entities
- User(id, name, role: requester|approver|admin, createdAt, updatedAt)
- Request(id, type, title, amount?, reason, status, createdBy, approverId?, createdAt, updatedAt)
- Attachment(id, requestId, url, filename, createdAt)
- Comment(id, requestId, userId, body, createdAt)
- AuditLog(id, actorId, targetType, targetId, action, payload?, createdAt)

## Status Machine
draft → submitted → approved | rejected
(reopenは今回は非対応、将来拡張)