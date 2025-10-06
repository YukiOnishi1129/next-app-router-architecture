# Architecture

## Directory Policy

/app         # routing & composition only (page/layout/loading/error, thin server actions)
#/features   # domain-oriented (components, hooks, actions, queries, schemas, types)
#/shared     # cross-cutting (ui, hooks, lib, schemas, styles)
#/external   # adapters/gateways/clients (DB, REST/gRPC, Google APIs)

- **app**: 画面特有の配線のみ。ビジネスロジック禁止。
- **features**: ドメインごとにUI/ロジック/型を近接配置。外部I/Oは`external`経由。
- **shared**: 純粋な再利用物。ドメイン知識を持たない。
- **external**: 外部接続の初期化と薄いCRUD/クライアント。整形はfeatures側。

## Data Flow (概略)
UI (app) → feature actions/queries → external adapters → (DB / Go BFF / APIs)

## Server/Client Boundary
- Server Actionsは薄い殻（`app/.../actions.ts`） or `features`直置きのどちらかで統一。
- 重要権限は**サーバー側ガード**で必ず検証。