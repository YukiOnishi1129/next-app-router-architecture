# ディレクトリ構成

```
src/
├── app/                                      # Next.js App Router
│   ├── layout.tsx                            # ルートレイアウト（Server Component）
│   ├── page.tsx                              # ルートページ
│   └── (authenticated)/                      # 認証が必要なセクション
│       ├── layout.tsx                        # 認証済みレイアウト
│       └── dashboard/
│           └── page.tsx                      # ダッシュボードトップ
├── features/                                 # 機能毎の独立モジュール
│   ├── requests/
│   │   ├── actions/                          # Server Actions (command/query)
│   │   ├── components/
│   │   │   ├── client/                       # Client Components（Container/Presenter）
│   │   │   │   └── RequestForm/
│   │   │   │       ├── RequestForm.tsx             # Re-export（Container）
│   │   │   │       ├── RequestFormContainer.tsx    # 状態オーケストレーション
│   │   │   │       ├── RequestFormPresenter.tsx    # プレゼンテーション
│   │   │   │       ├── useRequestForm.ts           # ビジネスロジックフック
│   │   │   │       ├── RequestForm.test.tsx        # コンテナ統合テスト
│   │   │   │       ├── useRequestForm.test.ts      # フック単体テスト
│   │   │   │       ├── RequestForm.stories.tsx     # ドキュメント用途（Container）
│   │   │   │       └── RequestFormPresenter.stories.tsx # UIバリエーション（Presenter）
│   │   │   └── server/                       # Server Components（Page Template等）
│   │   │       └── NewRequestPageTemplate/
│   │   │           └── NewRequestPageTemplate.tsx
│   │   ├── hooks/                            # TanStack Query ラッパーなどクライアントフック
│   │   ├── queries/                          # queryKeys 等の共有定義
│   │   ├── schemas/                          # zod スキーマ
│   │   └── types/                            # 型定義
│   └── settings/
│       ├── actions/                            # 機能専用の Server Actions ラッパー
│       ├── components/
│       │   ├── client/
│       │   │   └── ProfileForm/
│       │   │       ├── ProfileForm.tsx
│       │   │       ├── ProfileFormContainer.tsx
│       │   │       ├── ProfileFormPresenter.tsx
│       │   │       ├── useProfileForm.ts
│       │   │       ├── ProfileForm.test.tsx
│       │   │       ├── useProfileForm.test.ts
│       │   │       ├── ProfileForm.stories.tsx
│       │   │       └── ProfileFormPresenter.stories.tsx
│       │   └── server/
│       │       └── ProfilePageTemplate/
│       │           └── ProfilePageTemplate.tsx
│       ├── hooks/
│       └── queries/
├── shared/                                  # 横断的な UI・ユーティリティ
│   ├── components/
│   │   ├── layout/
│   │   │   ├── client/                       # Client Layout Components
│   │   │   └── server/                       # Server Layout Wrappers
│   │   └── ui/                              # Shadcn UIベースの部品
│   ├── lib/                                  # ヘルパー、ユーティリティ
│   └── providers/                            # Context Providers
└── external/                                 # Server 専用の外部連携レイヤー
    ├── dto/                                  # Zod スキーマ & DTO 定義
    ├── handler/                              # Command / Query Server Functions & Actions
    ├── repository/                           # DBアクセス
    ├── service/                              # ドメインロジック
    └── client/                               # 外部APIクライアント
```

## コンポーネント・ディレクトリのルール

1. `components/` 直下に `index.ts` を置かない。機能ごとのエクスポートは各 Page や Container から直接参照する。
2. `components/client/**` 直下に `index.ts` を置かない。Client Component はコンテナ（例: `RequestForm.tsx`）をエントリーポイントとして、Container/Presenter/Hook/Story/Test をディレクトリ内で完結させる。
3. `components/server/**` 直下にも `index.ts` を置かない。Server Component は Page Template など単一のエクスポートで完結させ、`import` はファイルパス指名で行う。
4. Container/Presenter/Hook/Story/Test の粒度は上記例を踏襲し、テストと Storybook ファイルは `tests/` と `stories/` フォルダに配置する。

## その他

- Server Component で `import 'server-only'` を宣言するのは `features/**/servers/**` や `external/**` のユーティリティだけ。`components/server/**` のコンポーネントは配置場所で server 専用と判断されるため不要。
- Client Component からの CRUD は TanStack Query 経由で `external/handler/**` の Server Action を呼び出す。直接 DB へアクセスしない。
