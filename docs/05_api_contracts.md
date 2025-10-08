# API Contracts (BFF)

> MVPではNext.js内Server Actionsで完結。将来、Go BFF/gRPCに置換可能なI/Fを定義。

## REST-ish (例)
- GET /api/requests?status=&q=&page=&size=
- GET /api/requests/:id
- POST /api/requests
- PATCH /api/requests/:id
- POST /api/requests/:id/approve
- POST /api/requests/:id/reject
- POST /api/requests/:id/comments