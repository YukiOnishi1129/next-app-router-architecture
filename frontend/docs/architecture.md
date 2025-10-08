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
   // features/users/actions/createUser.ts
   export async function createUserAction(data: CreateUserInput) {
     const validated = createUserSchema.parse(data)
     const user = await createUser(validated) // external層を呼び出し
     revalidatePath('/users')
     return { success: true, user }
   }
   ```

3. **External層での実行**
   ```typescript
   // external/db/users.ts
   import 'server-only'
   export async function createUser(data: CreateUserData) {
     return await db.insert(users).values(data).returning()
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

### Server Actionsの配置戦略

1. **app層に配置する場合**（薄い殻パターン）
   ```typescript
   // app/users/actions.ts
   'use server'
   import { createUser } from '@/features/users/actions'
   
   export async function createUserAction(formData: FormData) {
     return createUser(formData)
   }
   ```

2. **features層に直接配置する場合**
   ```typescript
   // features/users/actions/index.ts
   'use server'
   export async function createUserAction(data: CreateUserInput) {
     // 直接実装
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