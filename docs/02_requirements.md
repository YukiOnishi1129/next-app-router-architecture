# Requirements

## Functional
1. Auth
   - Sign-in (シンプル想定で可), Session取得
2. Requests
   - Create / Read (list & detail) / Update / Delete (論理削除でも可)
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
6. Notifications (MVP: UIトースト、将来Slack/Webhook)
7. RBAC
   - requester: 自分の申請のCRUD（承認は不可）
   - approver: 自分が担当の申請の承認/却下
   - admin: すべて閲覧＋権限付与

## Screens
- `/requests` (list) — filters, pagination
- `/requests/new` — form with validation
- `/requests/[id]` — detail, status history, comments, approve/reject
- `/settings/profile` — 自分の情報

## Validation (例)
- title: 1..120 chars
- amount: >= 0
- reason: 1..2000 chars
- attachments: max 10 files, each <= 10MB (MVP: URLのみ)

## Non-Functional (要点)
- 初期目標: 100同時ユーザー / P95 < 300ms (RSC取得)
- 監査: 申請作成/更新/承認操作を記録
- セキュリティ: SSR側での権限チェックを必須化