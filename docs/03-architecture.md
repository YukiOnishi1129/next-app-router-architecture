# Architecture

## Directory Policy

/app         # routing and composition only (page/layout/loading/error, thin server actions)
/features    # domain-oriented (components, hooks, actions, queries, schemas, types)
/shared      # cross-cutting (ui, hooks, lib, schemas, styles)
/external    # adapters/gateways/clients (DB, REST/gRPC, Google APIs)

- **app**: Page wiring and layout composition only. Keep business logic out.
- **features**: Co-locate UI, logic, schemas, and hooks per domain. All external I/O flows through `external`.
- **shared**: Purely reusable components/utilities without domain knowledge.
- **external**: Initialization of external connections plus thin CRUD clients. Data shaping happens in the feature layer.

## Data Flow (overview)
UI (app) → feature actions/queries → external adapters → (DB / Identity Platform / APIs)

## Server/Client Boundary
- Keep Server Actions thin wrappers living either under `app/.../actions.ts` or directly inside `features`.
- Always enforce privileged checks on the server (RSC/Server Actions). Never rely on client-only guards.
