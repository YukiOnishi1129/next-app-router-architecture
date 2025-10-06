# Documentation Index

このリポジトリは、Next.js App Routerを使用した保守性と拡張性の高いフロントエンドアーキテクチャのベストプラクティスを示すサンプルプロジェクトです。dev.toで公開予定の記事の参考実装となります。

## プロジェクトの目的

- Next.js App Routerの最適な設計方針を実例で示す
- 保守性と拡張性を重視したフロントエンド設計のベストプラクティスを提供
- 実践的な技術スタックの組み合わせを提示

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **TanStack Query** - データフェッチとキャッシュ管理
- **React Hook Form + Zod** - フォーム管理とバリデーション
- **Shadcn UI** - UIコンポーネントライブラリ

### バックエンド / データ層
- **PostgreSQL** - データベース
- **Drizzle ORM** - TypeScript向けORM
- **Server Actions / Server Components** - サーバーサイド処理

### 開発環境
- **Docker Compose** - PostgreSQLコンテナ管理
- **pnpm** - パッケージマネージャ

## アーキテクチャの特徴

1. **External層の分離**: バックエンド専用処理（DB接続、外部API）を`frontend/external`に集約
2. **型安全性**: End-to-endの型安全性を確保
3. **キャッシュ戦略**: TanStack Queryによる効率的なデータ管理
4. **フォーム処理**: React Hook Form + Zodによる堅牢なフォーム実装
5. **コンポーネント設計**: 再利用可能なUIコンポーネントの構築

## ドキュメント構成

### システムドキュメント
- [01 System Overview](./01_system_overview.md)
- [02 Requirements](./02_requirements.md)
- [03 Architecture](./03_architecture.md)
- [04 Data Model](./04_data_model.md)
- [05 API Contracts](./05_api_contracts.md)
- [06 Workflows](./06_workflows.md)
- [07 Non-Functional](./07_nonfunctional.md)
- [08 Env & Local Setup](./08_env_and_local.md)

### フロントエンド詳細ドキュメント
フロントエンド固有の設計・実装詳細は[frontend/docs](../frontend/docs/)を参照してください。