# アーキテクチャ

## ディレクトリポリシー

```
frontend/src/
├── app/         # ルーティングと画面構成のみ（page/layout/loading/error、薄いserver actions）
├── features/    # ドメイン指向（components、hooks、actions、queries、schemas、types）
├── shared/      # 横断的関心事（ui、hooks、lib、schemas、styles）
└── external/    # アダプター/ゲートウェイ/クライアント（DB、REST/gRPC、外部API）
```

### 各ディレクトリの責務

- **app**: 画面固有の配線のみ。ビジネスロジック禁止。ルーティングとレイアウトに専念
- **features**: ドメインごとにUI/ロジック/型を近接配置。外部I/Oは`external`経由
- **shared**: 純粋な再利用可能コンポーネント。ドメイン知識を持たない
- **external**: 外部接続の初期化と薄いCRUD/クライアント。データ整形はfeatures側で実施

## データフロー

```
UI (app) → feature actions/queries → external adapters → (DB / BFF / External APIs)
```

### 詳細なデータフロー例

1. **ユーザー操作**
   - ユーザーがUI（app層のページ）でボタンをクリック

2. **Feature層での処理**
   ```typescript
   // features/requests/actions/submitRequest.action.ts
   'use server'
   import { revalidatePath } from 'next/cache'
   import { createRequestSchema } from '@/features/requests/schemas/createRequest'
   import { createRequestServer } from '@/external/handler/request/command.server'

   export async function submitRequestAction(rawInput: unknown) {
     const input = createRequestSchema.parse(rawInput)
     const request = await createRequestServer(input) // external層を呼び出し
     revalidatePath('/requests')
     return { success: true, data: request }
   }
   ```

3. **External層での実行**
   ```typescript
   // external/handler/request/command.server.ts
   import 'server-only'
   import { db } from '@/external/client/db/client'
   import { requests } from '@/external/client/db/schema/requests'
   import { auditRequestCreated } from '@/external/service/audit'

   export async function createRequestServer(data: CreateRequestInput) {
     const [record] = await db
       .insert(requests)
       .values({
         ...data,
         status: 'submitted',
       })
       .returning()

     await auditRequestCreated({
       requestId: record.id,
       actorId: data.requesterId,
     })

     return record
   }
   ```

## Server/Client境界

### Server Components vs Client Components

- **Server Components（デフォルト）**: 
  - データフェッチング、認証チェック、重い処理
  - `async`関数として定義可能
  - 直接データベースアクセス可能

- **Client Components（'use client'）**: 
  - インタラクティブな要素（useState、useEffect）
  - ブラウザAPIの使用
  - イベントハンドラー

#### Feature内での配置ポリシー

各featureは`components/server`と`components/client`を持ち、以下のように役割を分担します。

- `components/server/*PageTemplate`: 申請一覧や詳細ページの枠組みを構築し、TanStack Queryの`HydrationBoundary`でデータをプリフェッチ
- `components/client/*Container`: 状態管理やServer Action呼び出しを担当（`useRequestList`などのフックを使用）
- `components/client/*Presenter`: 純粋なUI。Propsのみを受け取り、副作用を持たない

この「Container / Presenter / Hook」の三層構造により、ビジネスロジックと見た目を分離し、テスト容易性とStorybookによるドキュメント性を高めます。

### Server Actionsの配置戦略

1. **app層に配置する場合**（薄い殻パターン）
   ```typescript
   // app/(authenticated)/requests/actions.ts
   'use server'
   import { submitRequestAction } from '@/features/requests/actions/submitRequest.action'
   
   export async function submitRequest(formData: FormData) {
     return submitRequestAction(Object.fromEntries(formData))
   }
   ```

2. **features層に直接配置する場合**
   ```typescript
   // features/approvals/actions/index.ts
   'use server'
   import { transitionRequestStatusServer } from '@/external/handler/request/command.server'

   export async function approveRequestAction(requestId: string, comment?: string) {
     return transitionRequestStatusServer({
       requestId,
       status: 'approved',
       comment,
     })
   }
   ```

**推奨**: プロジェクト内で一貫性を保つため、どちらか一方に統一する

### セキュリティ境界

- 重要な権限チェックは**必ずサーバー側**で実施
- クライアント側の検証は UX 向上のためのみ
- 認証・認可はmiddleware.tsとServer Components/Actionsで二重チェック

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// app/dashboard/page.tsx
import { verifySession } from '@/external/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  
  // ダッシュボードのコンテンツ
}
```

## アーキテクチャ原則

1. **単一責任の原則**: 各層・モジュールは明確な責務を持つ
2. **依存関係の逆転**: 上位層は下位層に依存しない
3. **インターフェース分離**: 必要最小限のインターフェースを公開
4. **開放閉鎖原則**: 拡張に対して開き、修正に対して閉じている
