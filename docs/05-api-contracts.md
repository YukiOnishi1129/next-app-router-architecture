# API Contracts (BFF)

> For the MVP we rely on Next.js Server Actions only. Interfaces are designed so a Go BFF/gRPC back end could be swapped in later.

## REST-ish (example)
- GET /api/requests?status=&q=&page=&size=
- GET /api/requests/:id
- POST /api/requests
- PATCH /api/requests/:id
- POST /api/requests/:id/approve
- POST /api/requests/:id/reject
- POST /api/requests/:id/comments
