# セキュリティ考慮事項

## 認証と認可

### Google Cloud Identity Platform統合

```typescript
// external/lib/auth/identity-platform.ts
import 'server-only'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Identity Platform API設定
const IDENTITY_PLATFORM_BASE_URL = `https://identitytoolkit.googleapis.com/v1`
const API_KEY = process.env.GCP_IDENTITY_PLATFORM_API_KEY

// IDトークンの検証
export async function verifyIdToken(idToken: string) {
  try {
    // Google Identity Platformのトークン検証エンドポイント
    const response = await fetch(
      `${IDENTITY_PLATFORM_BASE_URL}/accounts:lookup?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )

    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    const data = await response.json()
    const user = data.users?.[0]
    
    if (!user) {
      return null
    }

    // IDトークンをデコードして追加情報を取得
    const decoded = jwt.decode(idToken) as any
    
    return {
      uid: user.localId,
      email: user.email,
      emailVerified: user.emailVerified || false,
      name: user.displayName || decoded?.name,
      picture: user.photoUrl || decoded?.picture,
      customClaims: user.customAttributes ? JSON.parse(user.customAttributes) : {},
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// セッションの作成
export async function createSession(idToken: string, refreshToken?: string) {
  const user = await verifyIdToken(idToken)
  if (!user) {
    return { success: false, error: 'Invalid token' }
  }

  const sessionData = {
    userId: user.uid,
    email: user.email,
    name: user.name,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1時間（IDトークンの有効期限に合わせる）
  }

  // JWTセッショントークンの生成
  const sessionToken = jwt.sign(
    sessionData,
    process.env.JWT_SECRET!,
    { algorithm: 'HS256' }
  )
  
  // セッショントークンを設定
  cookies().set('session', sessionToken, {
    maxAge: 60 * 60 * 24 * 7, // 7日間
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  
  // リフレッシュトークンを別のCookieに保存
  if (refreshToken) {
    cookies().set('refresh-token', refreshToken, {
      maxAge: 60 * 60 * 24 * 30, // 30日間
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }
  
  return { success: true }
}

// トークンのリフレッシュ
export async function refreshTokens() {
  const refreshToken = cookies().get('refresh-token')?.value
  
  if (!refreshToken) {
    return { success: false, error: 'No refresh token' }
  }
  
  try {
    // Google OAuth2のトークンリフレッシュエンドポイント
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GCP_CLIENT_ID!,
        client_secret: process.env.GCP_CLIENT_SECRET!,
        grant_type: 'refresh_token',
      }),
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    const tokens = await response.json()
    
    // 新しいIDトークンで検証とセッション作成
    const user = await verifyIdToken(tokens.id_token)
    if (!user) {
      throw new Error('Invalid refreshed token')
    }
    
    // 新しいトークンでセッションを更新
    await createSession(tokens.id_token, tokens.refresh_token)
    
    return { success: true, idToken: tokens.id_token }
  } catch (error) {
    console.error('Token refresh error:', error)
    return { success: false, error: 'Failed to refresh token' }
  }
}
```

### Middleware での認証チェック

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 公開ルートはスキップ
  const publicPaths = ['/login', '/signup', '/forgot-password', '/api/auth']
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // セッションCookieの検証
  const session = request.cookies.get('session')
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // JWTトークンの検証
    const decoded = jwt.verify(session.value, process.env.JWT_SECRET!) as any
    
    // トークンの有効期限チェック
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      // セッションが期限切れの場合、リフレッシュトークンで更新を試みる
      const refreshToken = request.cookies.get('refresh-token')?.value
      
      if (!refreshToken) {
        throw new Error('No refresh token')
      }
      
      // トークンリフレッシュAPI呼び出し
      // 注：Middlewareでは外部APIを呼び出すべきではないので、
      // 実際にはクライアント側でリフレッシュを処理するか、
      // 専用のAPIルートにリダイレクトする
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?redirect=${pathname}`, request.url)
      )
    }
    
    // カスタムクレームによる認可
    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url))
    }
    
    // リクエストヘッダーにユーザー情報を追加
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    response.cookies.delete('refresh-token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## CSRF対策

### Server Actions での CSRF トークン

```typescript
// external/lib/csrf.ts
import 'server-only'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export function generateCSRFToken() {
  const token = randomBytes(32).toString('hex')
  
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1時間
  })
  
  return token
}

export function verifyCSRFToken(token: string) {
  const storedToken = cookies().get('csrf-token')?.value
  return storedToken && storedToken === token
}

// external/actions/with-csrf.ts
'use server'

import { verifyCSRFToken } from '../lib/csrf'

export async function protectedAction(formData: FormData) {
  const csrfToken = formData.get('csrf-token')
  
  if (!csrfToken || typeof csrfToken !== 'string' || !verifyCSRFToken(csrfToken)) {
    throw new Error('Invalid CSRF token')
  }
  
  // アクションの処理
}
```

## 入力検証とサニタイゼーション

### Zodによる厳格な入力検証

```typescript
// features/comments/schemas/comment.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// XSS対策を含むスキーマ
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(1000, '1000文字以内で入力してください')
    .transform((val) => {
      // HTMLタグを除去
      return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
    }),
  parentId: z.string().uuid().optional(),
})

// SQLインジェクション対策（Drizzle ORMが自動的に処理）
export async function createComment(input: CreateCommentInput) {
  const validated = createCommentSchema.parse(input)
  
  // Drizzle ORMがパラメータ化クエリを使用
  return await db.insert(comments).values({
    content: validated.content,
    parentId: validated.parentId,
    userId: session.userId,
  })
}
```

## 環境変数の管理

### 型安全な環境変数

```typescript
// shared/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Public環境変数（クライアントで使用可能）
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  
  // Server環境変数（サーバーのみ）
  DATABASE_URL: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
})

// 起動時に検証
export const env = envSchema.parse(process.env)

// クライアント用の環境変数エクスポート
export const publicEnv = {
  appUrl: env.NEXT_PUBLIC_APP_URL,
  firebase: {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  },
}
```

## コンテンツセキュリティポリシー（CSP）

```typescript
// app/layout.tsx
import { headers } from 'next/headers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') || ''
  
  return (
    <html>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={`
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' https://apis.google.com;
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data: https:;
            font-src 'self';
            connect-src 'self' https://identitytoolkit.googleapis.com;
            frame-src 'self' https://accounts.google.com;
          `}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## レート制限

```typescript
// external/lib/rate-limit.ts
import 'server-only'
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1分
  })

  return {
    check: async (token: string, limit: number) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0]
      const currentCount = tokenCount[0]
      
      if (currentCount >= limit) {
        return { success: false, remaining: 0 }
      }
      
      tokenCount[0] = currentCount + 1
      tokenCache.set(token, tokenCount)
      
      return { success: true, remaining: limit - currentCount - 1 }
    },
  }
}

// 使用例
const limiter = rateLimit({
  interval: 60 * 1000, // 1分
  uniqueTokenPerInterval: 500,
})

export async function protectedApiRoute(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous'
  const { success, remaining } = await limiter.check(ip, 10) // 1分間に10回まで
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
  
  // 処理を続行
}
```

## セキュアなファイルアップロード

```typescript
// external/actions/upload.ts
'use server'

import { verifySession } from '@/external/lib/auth'
import { z } from 'zod'
import sharp from 'sharp'
import { randomUUID } from 'crypto'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadAvatar(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error('Unauthorized')
  
  const file = formData.get('file') as File
  
  // ファイルタイプ検証
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  // ファイルサイズ検証
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large')
  }
  
  // ファイル内容の検証（マジックバイト）
  const buffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(buffer)
  
  // 画像処理とサニタイゼーション
  const processedImage = await sharp(fileBuffer)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()
  
  // 安全なファイル名生成
  const filename = `${session.userId}/${randomUUID()}.jpg`
  
  // Google Cloud Storageへアップロード
  await uploadToStorage(filename, processedImage)
  
  return { success: true, filename }
}
```

## エラーハンドリング

```typescript
// shared/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// センシティブな情報を含まないエラーレスポンス
export function sanitizeError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
    }
  }
  
  // 本番環境では詳細なエラー情報を隠す
  if (process.env.NODE_ENV === 'production') {
    console.error('Unexpected error:', error)
    return {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }
  }
  
  return {
    error: error instanceof Error ? error.message : 'Unknown error',
    code: 'UNKNOWN_ERROR',
  }
}
```

## セキュリティヘッダー

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

## ベストプラクティス

1. **最小権限の原則**: ユーザーには必要最小限の権限のみを付与
2. **Defense in Depth**: 複数層でのセキュリティ対策
3. **早期の入力検証**: 可能な限り早い段階で入力を検証
4. **セキュアなデフォルト**: デフォルト設定を安全に
5. **定期的な依存関係の更新**: セキュリティパッチの適用