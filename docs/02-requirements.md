# Requirements

## Functional
1. Auth
   - Email/password sign-in, session retrieval
2. Requests
   - Create / Read (list & detail) / Update / Delete (soft delete acceptable)
   - Fields: title, type(expense|purchase|access), amount?, reason, attachments[]
   - Status: draft → submitted → approved | rejected
3. Listing & Filters
   - Filters: status, type, date range, "my requests", "pending approvals"
   - Sort & pagination
4. Approval
   - Approver only: approve/reject with optional comment
   - Audit log (who/when/what)
5. Comments
   - Threaded or flat; visible on detail page
6. Notifications (MVP: UI toast, later Slack/Webhook)
7. RBAC
   - requester: CRUD on own requests (no approval)
   - approver: Approve / reject assigned requests
   - admin: Full visibility + role management

## Screens
- `/requests` (list) — filters, pagination
- `/requests/new` — form with validation
- `/requests/[id]` — detail, status history, comments, approve/reject
- `/settings/profile` — user profile

## Validation (example)
- title: 1..120 chars
- amount: >= 0
- reason: 1..2000 chars
- attachments: max 10 files, each <= 10MB (MVP: URL only)

## Non-Functional (highlights)
- Baseline target: 100 concurrent users / P95 < 300ms for primary RSC fetch
- Audit: Log request create/update/approval actions
- Security: Enforce authorization on the server (RSC/Server Actions)
