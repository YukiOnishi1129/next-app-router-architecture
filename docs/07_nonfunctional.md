# Non-Functional

- Performance: P95 < 300ms for main list (cached RSC); client actions < 500ms UX
- Security: server-side RBAC checks; avoid exposing privileged actions to client
- Observability: minimal audit logs + console; 将来 APM/trace に拡張
- Accessibility: keyboard nav, ARIA, focus ring
- i18n: 英語/日本語を想定（MVPは英語固定でも可）