# Non-Functional

- Performance: P95 < 300ms for main list (cached RSC); client actions < 500ms UX
- Security: server-side RBAC checks; avoid exposing privileged actions to client
- Observability: minimal audit logs + console logging; plan for future APM/trace integration
- Accessibility: keyboard nav, ARIA, focus ring
- i18n: English-first, design with Japanese expansion in mind
